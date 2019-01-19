import { decorate, observable, flow } from 'mobx';
const { formatQuery } = require('pg-promise/lib/formatting');
import Fetcher from './Fetcher';

type DbPolicyArgs = {
  name: string,
  permissive: boolean,
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL',
  qualifier: ?string,
  check: ?string,
  roles: Array<string>,
  schemaName: string,
  tableName: string,
  db: Object, // TODO: proper type
};

type UpdatePolicyData = {
  name: string,
  permissive: boolean,
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL',
  qualifier: ?string,
  check: ?string,
  roles: Array<string>,
};

export const dbPolicyCommandTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL'];

class DbPolicy {

  constructor(params: DbPolicyArgs) {
    const {
      name,
      permissive,
      command,
      qualifier,
      check,
      roles,
      schemaName,
      tableName,
      db,
    } = params;

    this.name = name;
    this.permissive = permissive;
    this.command = command;
    this.qualifier = qualifier;
    this.check = check;
    this.roles = roles;
    this.schemaName = schemaName;
    this.tableName = tableName;
    this.db = db;
  }

  static update = flow(function * updatePolicy(policy: DbPolicy, dataForUpdate: UpdatePolicyData) {
    const fetcher = new Fetcher({
      fetch: () => {
        return policy.db.tx(async t => {
          const names = { name: dataForUpdate.name, schemaName: policy.schemaName, tableName: policy.tableName };
          const policyQueryPart = formatQuery('policy $(name:name) on $(schemaName:name).$(tableName:name)', names);
          const commandAndRoles = {
            command: dataForUpdate.command,
            roles: dataForUpdate.roles,
          };
          const typeQueryPart = dataForUpdate.permissive ? '' : 'as restrictive';
          const forQueryPart = formatQuery(`for $(command:raw) to $(roles:name)`, commandAndRoles);
          const qualifierQueryPart = dataForUpdate.qualifier ? `using (${dataForUpdate.qualifier})` : '';
          const checkQueryPart = dataForUpdate.check ? `with check (${dataForUpdate.check})` : '';
          await t.none(`drop ${policyQueryPart};`);
          await t.none(
            `create ${policyQueryPart} ${typeQueryPart} ${forQueryPart} ${qualifierQueryPart} ${checkQueryPart};`
          );
        });
      },
    });

    yield fetcher.fetch();

    if (fetcher.inSuccessState) {
      Object.assign(policy, dataForUpdate);
    }

    return fetcher;
  })
}

decorate(DbPolicy, {
  name: observable,
  permissive: observable,
  command: observable,
  qualifier: observable,
  check: observable,
  roles: observable,
});

export default DbPolicy;
