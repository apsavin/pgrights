import { decorate, observable } from 'mobx';
import { get } from 'lodash';

type DbPrivilege = {
  grantor: string,
  grantee: string,
  type: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT' | 'REFERENCES',
  isGrantable: boolean,
};

class DbPrivilegesManager<Privilege: DbPrivilege> {
  constructor() {
    this.privilegesByGrantee = {};
  }

  add(privilege: Privilege) {
    this.privilegesByGrantee[privilege.grantee] = this.privilegesByGrantee[privilege.grantee] || {};
    this.privilegesByGrantee[privilege.grantee][privilege.type] = privilege;
  }

  get(grantee, type): ?Privilege {
    return get(this.privilegesByGrantee, [grantee, type]);
  }
}

decorate(DbPrivilegesManager, {
  privilegesByGrantee: observable,
});

export default DbPrivilegesManager;
