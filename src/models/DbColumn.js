import { decorate, observable } from 'mobx';
import { get } from 'lodash';
import DbPrivilegesManager from './DbPrivilegesManager';

type DbColumnPrivilege = {
  grantor: string,
  grantee: string,
  type: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT' | 'REFERENCES',
  isGrantable: boolean,
};

export const dbColumnPrivilegeTypes = ['SELECT', 'UPDATE', 'DELETE', 'INSERT', 'REFERENCES'];

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
