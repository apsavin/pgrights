import { decorate, observable } from 'mobx';
import { get, set } from 'lodash';

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

  get(grantee, type): Privilege | null {
    return get(this.privilegesByGrantee, [grantee, type], null);
  }

  remove(grantee, type): void {
    set(this.privilegesByGrantee, [grantee, type], null);
  }
}

decorate(DbPrivilegesManager, {
  privilegesByGrantee: observable,
});

export default DbPrivilegesManager;
