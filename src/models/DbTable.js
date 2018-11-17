import { decorate, observable, flow } from 'mobx';
import DbColumn from './DbColumn';
import DbPrivilegesManager from './DbPrivilegesManager';

type DbTablePrivilege = {
  grantor: string,
  grantee: string,
  type: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT' | 'REFERENCES' | 'TRUNCATE' | 'TRIGGER' | 'DELETE',
  isGrantable: boolean,
  withHierarchy: boolean,
};

export const dbTablePrivilegeTypes = ['SELECT', 'UPDATE', 'DELETE', 'INSERT', 'REFERENCES', 'TRUNCATE', 'TRIGGER'];

class DbTable {
  privileges: DbPrivilegesManager<DbTablePrivilege>;

  constructor({ name, db, schemaName }) {
    this.name = name;
    this.db = db;
    this.schemaName = schemaName;
    this.columns = {};
    this.columnsNames = [];
    this.privileges = new DbPrivilegesManager();
  }

  fetchColumns = flow(function* fetchColumns() {
    const { name: tableName, schemaName, db } = this;
    const columnsPrivileges = yield db.query(
        `select *
           from information_schema.column_privileges as cp
           where cp.table_schema = $(schemaName)
             and cp.table_name = $(tableName);`,
      { schemaName, tableName },
    );

    this.columns = {};
    this.columnsNames = [];

    columnsPrivileges.forEach((privilegeData) => {
      const {
        column_name: name,
        grantor,
        grantee,
        privilege_type: type,
        is_grantable
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
    const { name: tableName, schemaName, db } = this;
    const tablePrivileges = yield db.query(
      `select * from information_schema.table_privileges as cp
           where cp.table_schema = $(schemaName) and cp.table_name = $(tableName);`,
      { schemaName, tableName },
    );

    this.privileges = new DbPrivilegesManager();

    tablePrivileges.forEach((privilegeData) => {
      const {
        grantor,
        grantee,
        privilege_type: type,
        is_grantable,
        with_hierarchy
      } = privilegeData;
      const isGrantable = is_grantable === 'YES';
      const withHierarchy = with_hierarchy === 'YES';
      this.privileges.add({ grantor, grantee, type, isGrantable, withHierarchy });
    });
  });
}

decorate(DbTable, {
  columns: observable,
  columnsNames: observable,
  privileges: observable,
});

export default DbTable;
