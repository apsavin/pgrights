import { decorate, observable } from 'mobx';
import { get } from 'lodash';
import DbPrivilegesManager from './DbPrivilegesManager';

type DbColumnPrivilege = {
  grantor: string,
  grantee: string,
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'REFERENCES',
  isGrantable: boolean,
};

export const dbColumnPrivilegeTypes = ['SELECT', 'INSERT', 'UPDATE', 'REFERENCES'];

class DbColumn {
  privileges: DbPrivilegesManager<DbColumnPrivilege>;

  constructor({ name, schemaName, tableName }) {
    this.name = name;
    this.schemaName = schemaName;
    this.tableName = tableName;
    this.privileges = new DbPrivilegesManager();
  }
}

decorate(DbColumn, {
  privileges: observable,
});

export default DbColumn;
