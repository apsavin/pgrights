import { decorate, observable, computed } from 'mobx';
import DbPolicy from './DbPolicy';

const NO_POLICIES = [];

class DbPoliciesManager {
  constructor() {
    this.policies = [];
  }

  add(policy: DbPolicy) {
    this.policies.push(policy);
  }

  get policiesByRole() {
    const policiesByRole = {};
    this.policies.forEach(policy => {
      policy.roles.forEach(role => {
        policiesByRole[role] = policiesByRole[role] || [];
        policiesByRole[role].push(policy);
      });
    });
    return policiesByRole;
  }

  getPolicies(role): Array<DbPolicy> {
    return this.policiesByRole[role] || NO_POLICIES;
  }
}

decorate(DbPoliciesManager, {
  policies: observable,
  policiesByRole: computed,
});

export default DbPoliciesManager;
