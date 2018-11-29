import { decorate, observable, flow } from 'mobx';
import pgArray from 'postgres-array';
import pgpFactory from 'pg-promise';
import DbSchema from './DbSchema';

const pgp = pgpFactory();

export type TDbConnectionData = {
  name: string,
  database: string,
  host: string,
  port: string,
  user: string,
  password: string
};

class DbConnection {
  constructor({ name, database, host, port, user, password }: TDbConnectionData) {
    this.name = name;

    this.database = database;
    this.host = host;
    this.port = port;
    this.user = user;
    this.password = password;

    this.roles = {};
    this.rolesNames = [];
    this.schemas = {};
    this.schemasNames = [];
  }

  getDb() {
    if (!this.db) {
      const { database, host, port, user, password } = this;
      this.db = pgp({ database, host, port, user, password });
    }
    return this.db;
  }

  fetchSchemas = flow(function* fetchSchemas() {
    const db = this.getDb();
    const schemas = yield db.query('select * from information_schema.schemata');

    this.schemasNames = [];
    this.schemas = {};

    schemas.forEach(({ schema_name: name }) => {
      this.schemasNames.push(name);
      this.schemas[name] = new DbSchema({ name, db });
    });
  });

  fetchRoles = flow(function* fetchSchemas() {
    const db = this.getDb();
    const roles = yield db.query(`
      select a.rolname, a.oid, array_agg(m.roleid) as parents_oids
        from pg_roles as a
             left join pg_auth_members as m on m.member = a.oid
        group by a.rolname, a.oid
        order by a.rolname;
    `);
    this.roles = {};
    const rolesByIds = {};

    roles.forEach((role) => {
      const { rolname: name, oid } = role;
      this.roles[name] = { oid, name };
      rolesByIds[oid] = this.roles[name];
    });
    this.rolesNames = Object.keys(this.roles);
    roles.forEach((role) => {
      const { rolname: name, parents_oids: parentsOids } = role;
      this.roles[name].parents = parentsOids.filter(Boolean).map(oid => rolesByIds[oid].name);
    });
  });
}

decorate(DbConnection, {
  roles: observable,
  rolesNames: observable,
  schemas: observable,
  schemasNames: observable,
});

export default DbConnection;
