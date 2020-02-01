import { decorate, observable, flow, computed } from 'mobx';
import keytar from 'keytar';
import pgpFactory from 'pg-promise';
import DbSchema from './DbSchema';
import Fetcher from './Fetcher';

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

    this.rolesFetcher = new Fetcher({
      fetch: async () => {
        const db = await this.getDb();
        return db.query(`
          select a.rolname, a.oid, a.rolsuper, a.rolbypassrls, array_agg(m.roleid) as parents_oids
            from pg_roles as a
                 left join pg_auth_members as m on m.member = a.oid
            group by a.rolname, a.oid, a.rolsuper, a.rolbypassrls
            order by a.rolname;
        `);
      },
    });

    this.schemasFetcher = new Fetcher({
      fetch: async () => {
        const db = await this.getDb();
        return db.query('select * from information_schema.schemata');
      },
    });
  }

  async getDb() {
    if (this.dbPromise) {
      await this.dbPromise;
    }
    if (!this.db) {
      this.dbPromise = new Promise(async (resolve) => {
        const { database, host, port, user } = this;
        const password = this.password || await keytar.getPassword(this.name, user);
        this.db = pgp({ database, host, port, user, password });
        resolve();
      });
      await this.dbPromise;
    }
    return this.db;
  }

  fetchSchemas = flow(function* fetchSchemas() {
    yield this.schemasFetcher.fetch();

    if (!this.schemasFetcher.inSuccessState) {
      return;
    }

    const schemas = this.schemasFetcher.result;
    const db = yield this.getDb();

    this.schemasNames = [];
    this.schemas = {};

    schemas.forEach(({ schema_name: name }) => {
      this.schemasNames.push(name);
      this.schemas[name] = new DbSchema({ name, db });
    });
  });

  fetchRoles = flow(function* fetchSchemas() {
    yield this.rolesFetcher.fetch();

    if (!this.rolesFetcher.inSuccessState) {
      return;
    }

    const roles = this.rolesFetcher.result;

    this.roles = {};
    const rolesByIds = {};

    roles.forEach((role) => {
      const { rolname: name, oid, rolsuper, rolbypassrls } = role;
      this.roles[name] = { oid, name, isSuperUser: rolsuper, bypassRLS: rolbypassrls };
      rolesByIds[oid] = this.roles[name];
    });
    this.rolesNames = Object.keys(this.roles);
    roles.forEach((role) => {
      const { rolname: name, parents_oids: parentsOids } = role;
      this.roles[name].parents = parentsOids.filter(Boolean).map(oid => rolesByIds[oid].name);
    });
  });

  get isFetched() {
    return this.rolesFetcher.inSuccessState && this.schemasFetcher.inSuccessState;
  }
}

decorate(DbConnection, {
  roles: observable,
  rolesNames: observable,
  schemas: observable,
  schemasNames: observable,
  isFetched: computed,
});

export default DbConnection;
