import { decorate, observable } from 'mobx';

type DbPolicy = {
  name: string,
  permissive: boolean,
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL',
  qualifier: ?string,
  check: ?string,
  roles: Array<string>
};

class DbPoliciesManager {
  constructor() {
    this.policiesByRole = {};
  }

  add(policy: DbPolicy) {
    policy.roles.forEach(role => {
      this.policiesByRole[role] = this.policiesByRole[role] || [];
      this.policiesByRole[role].push(policy);
    });
  }

  getPolicies(role): Array<DbPolicy> {
    return this.policiesByRole[role] || [];
  }
}

decorate(DbPoliciesManager, {
  policiesByRole: observable,
});

export default DbPoliciesManager;
