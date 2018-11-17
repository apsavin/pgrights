import { decorate, observable, flow } from 'mobx';
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

    schemas.forEach(({ schema_name: name } ) => {
      this.schemasNames.push(name);
      this.schemas[name] = new DbSchema({ name, db });
    });
  });

  fetchRoles = flow(function* fetchSchemas() {
    const db = this.getDb();
    const roles = yield db.query('select * from pg_catalog.pg_roles order by rolname;');
    this.rolesNames = roles.map(({ rolname }) => rolname);
  });
}

decorate(DbConnection, {
  rolesNames: observable,
  schemas: observable,
  schemasNames: observable,
});

export default DbConnection;
