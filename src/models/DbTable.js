import { decorate, observable, flow, computed } from 'mobx';
import pgArray from 'postgres-array';
import DbColumn from './DbColumn';
import DbPrivilegesManager from './DbPrivilegesManager';
import DbPoliciesManager from './DbPoliciesManager';
import Fetcher from './Fetcher';
import DbPolicy from './DbPolicy';

type DbTablePrivilege = {
  grantor: string,
  grantee: string,
  type: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT' | 'REFERENCES' | 'TRUNCATE' | 'TRIGGER' | 'DELETE',
  isGrantable: boolean,
  withHierarchy: boolean,
};

export const dbTablePrivilegeTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'];

class DbTable {
  privileges: DbPrivilegesManager<DbTablePrivilege>;

  constructor({ name, isRlsEnabled, db, schemaName }) {
    this.name = name;
    this.isRlsEnabled = isRlsEnabled;
    this.db = db;
    this.schemaName = schemaName;
    this.columns = {};
    this.columnsNames = [];

    this.privileges = new DbPrivilegesManager();
    this.policies = new DbPoliciesManager();

    const tableName = name;
    this.columnsFetcher = new Fetcher({
      fetch: () => {
        return db.query(
            `select *
               from information_schema.column_privileges as cp
               where cp.table_schema = $(schemaName)
                 and cp.table_name = $(tableName);`,
          { schemaName, tableName },
        );
      },
    });
    this.privilegesFetcher = new Fetcher({
      fetch: () => {
        return db.query(
          `select *
           from information_schema.table_privileges as cp
           where cp.table_schema = $(schemaName)
             and cp.table_name = $(tableName);`,
          { schemaName, tableName },
        );
      },
    });
    this.policiesFetcher = new Fetcher({
      fetch: () => {
        return db.query(
            `select *
               from pg_catalog.pg_policies as p
               where p.schemaname = $(schemaName)
                 and p.tablename = $(tableName)
               order by policyname;`,
          { schemaName, tableName },
        );
      },
    });
  }

  fetchColumns = flow(function* fetchColumns() {
    const { name: tableName, schemaName } = this;
    yield this.columnsFetcher.fetch();

    if (!this.columnsFetcher.inSuccessState) {
      return;
    }

    const columnsPrivileges = this.columnsFetcher.result;

    this.columns = {};
    this.columnsNames = [];

    columnsPrivileges.forEach((privilegeData) => {
      const {
        column_name: name,
        grantor,
        grantee,
        privilege_type: type,
        is_grantable,
      } = privilegeData;
      if (!this.columns[name]) {
        this.columnsNames.push(name);
        this.columns[name] = new DbColumn({ name, schemaName, tableName });
      }
      const isGrantable = is_grantable === 'YES';
      this.columns[name].privileges.add({ grantor, grantee, type, isGrantable });
    });
  });

  fetchPrivileges = flow(function* fetchPrivileges() {
    yield this.privilegesFetcher.fetch();

    if (!this.privilegesFetcher.inSuccessState) {
      return;
    }
    const tablePrivileges = this.privilegesFetcher.result;

    this.privileges = new DbPrivilegesManager();

    tablePrivileges.forEach((privilegeData) => {
      const {
        grantor,
        grantee,
        privilege_type: type,
        is_grantable,
        with_hierarchy,
      } = privilegeData;
      const isGrantable = is_grantable === 'YES';
      const withHierarchy = with_hierarchy === 'YES';
      this.privileges.add({ grantor, grantee, type, isGrantable, withHierarchy });
    });
  });

  fetchPolicies = flow(function* fetchPolicies() {
    yield this.policiesFetcher.fetch();

    if (!this.policiesFetcher.inSuccessState) {
      return;
    }
    const policies = this.policiesFetcher.result;
    this.policies = new DbPoliciesManager();

    policies.forEach((policyData) => {
      const {
        policyname: name,
        permissive,
        cmd: command,
        qual: qualifier,
        with_check: check,
        roles,
        schemaname: schemaName,
        tablename: tableName,
      } = policyData;
      const policy = new DbPolicy({
        name,
        permissive: permissive === 'PERMISSIVE',
        command,
        qualifier,
        check,
        roles: pgArray.parse(roles),
        schemaName,
        tableName,
        db: this.db,
      });

      this.policies.add(policy);
    });
  });

  get isFetched() {
    return this.columnsFetcher.inSuccessState &&
      this.privilegesFetcher.inSuccessState &&
      this.policiesFetcher.inSuccessState;
  }
}

decorate(DbTable, {
  columns: observable,
  columnsNames: observable,
  privileges: observable,
  policies: observable,
  isFetched: computed,
});

export default DbTable;
