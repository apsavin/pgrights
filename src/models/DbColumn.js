import { decorate, observable } from 'mobx';
import { get } from 'lodash';

type Privilege = {
  name: string,
  grantor: string,
  grantee: string,
  type: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT' | 'REFERENCES',
  isGrantable: boolean,
};

class DbColumn {
  constructor({ name, connectionName, schemaName, tableName }) {
    this.name = name;
    this.connectionName = connectionName;
    this.schemaName = schemaName;
    this.tableName = tableName;
    this.privilegesByGrantee = {};
  }

  addPrivilege(privilege: Privilege) {
    this.privilegesByGrantee[privilege.grantee] = this.privilegesByGrantee[privilege.grantee] || {};
    this.privilegesByGrantee[privilege.grantee][privilege.type] = privilege;
  }

  getPrivilege(grantee, type) {
    return get(this.privilegesByGrantee, [grantee, type]);
  }
}

decorate(DbColumn, {
  privilegesByGrantee: observable,
});

export default DbColumn;
