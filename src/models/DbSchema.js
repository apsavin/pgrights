import { decorate, observable, flow } from 'mobx';
import apiActions from '../constants/apiActions';
import { sendRequest } from '../utils/api';
import DbTable from './DbTable';

class DbSchema {
  constructor({ name, connectionName }) {
    this.name = name;
    this.connectionName = connectionName;
    this.tables = {};
    this.tablesNames = [];
  }

  fetchTables = flow(function* fetchTables() {
    const schemaName = this.name;
    const connectionName = this.connectionName;
    const tables = yield sendRequest({ action: apiActions.getSchemaTables, data: { schemaName } });

    this.tables = {};
    this.tablesNames = [];

    tables.forEach(({ table_name: name }) => {
      this.tablesNames.push(name);
      this.tables[name] = new DbTable({ name, connectionName, schemaName });
    });
  });
}

decorate(DbSchema, {
  tables: observable,
  tablesNames: observable,
});

export default DbSchema;
