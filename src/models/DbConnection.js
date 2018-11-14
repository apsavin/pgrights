import { decorate, observable, flow } from 'mobx';
import apiActions from '../constants/apiActions';
import { sendRequest } from '../utils/api';
import DbSchema from './DbSchema';

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

  fetchSchemas = flow(function* fetchSchemas() {
    const schemas = yield sendRequest({ action: apiActions.getDatabaseSchemas });
    const connectionName = this.name;

    this.schemasNames = [];
    this.schemas = {};

    schemas.forEach(({ schema_name: name } ) => {
      this.schemasNames.push(name);
      this.schemas[name] = new DbSchema({ name, connectionName });
    });
  });

  fetchRoles = flow(function* fetchSchemas() {
    const roles = yield sendRequest({ action: apiActions.getRoles });
    this.rolesNames = roles.map(({ rolname }) => rolname);
  });
}

decorate(DbConnection, {
  rolesNames: observable,
  schemas: observable,
  schemasNames: observable,
});

export default DbConnection;
