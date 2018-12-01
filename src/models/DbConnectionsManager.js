import { decorate, observable, flow, action, computed } from 'mobx';
import { boundMethod } from 'autobind-decorator'
import persistentStorage from '../persistentStorage';
import DbConnection from './DbConnection';
import type { TDbConnectionData } from './DbConnection';
import DbTable from './DbTable';
import DbSchema from './DbSchema';

class DbConnectionsManager {
  constructor() {
    this.currentConnectionName = '';
    this.editingConnectionName = '';
    this.currentSchemaName = '';
    this.currentTableName = '';
    this.currentRoleName = '';
    this.connections = {};
    this.connectionsNames = [];
    this.error = '';
  }

  addConnection(connectionData: TDbConnectionData, updateStorage = true) {
    const connection = new DbConnection(connectionData);
    const rewrite = this.connections[connection.name];
    this.connections[connection.name] = connection;
    if (updateStorage) {
      persistentStorage.set('connections', {
        ...(persistentStorage.get('connections') || {}),
        [connection.name]: connection,
      });
    }
    if (!rewrite) {
      this.connectionsNames.push(connection.name);
    }
  }

  addConnections(connectionsData) {
    Object.keys(connectionsData).forEach(key => {
      this.addConnection(connectionsData[key], false);
    });
  }

  getCurrentConnection(): DbConnection {
    return this.connections[this.currentConnectionName];
  }

  connect = flow(function* connect({ connectionName }) {
    this.currentConnectionName = connectionName;
    const connection = this.getCurrentConnection();
    yield Promise.all([
      connection.fetchSchemas(),
      connection.fetchRoles(),
    ]);
    if (!connection.isFetched) {
      this.currentConnectionName = '';
      this.error = connection.schemasFetcher.error || connection.rolesFetcher.error;
      return;
    }
    this.currentRoleName = connection.user;
    const firstSchemaName = connection.schemasNames.find((name) => name === 'public') || connection.schemasNames[0];
    yield this.setCurrentSchema({ schemaName: firstSchemaName });
  }).bind(this);

  getCurrentSchema(): DbSchema {
    return this.getCurrentConnection().schemas[this.currentSchemaName];
  }

  setCurrentSchema = flow(function* setCurrentSchema({ schemaName }) {
    this.currentSchemaName = schemaName;
    const schema = this.getCurrentSchema();
    if (!schema.tablesFetcher.inSuccessState) {
      yield schema.fetchTables();
    }
    this.error = schema.tablesFetcher.error;
    if (schema.tablesNames.length) {
      yield this.setCurrentTable({ tableName: schema.tablesNames[0] });
    }
  }).bind(this);

  getCurrentTable(): ?DbTable {
    return this.getCurrentSchema().tables[this.currentTableName];
  }

  setCurrentTable = flow(function* setCurrentTable({ tableName }) {
    this.currentTableName = tableName;
    const table = this.getCurrentTable();
    if (table.isFetched) {
      return;
    }
    yield Promise.all([
      table.fetchColumns(),
      table.fetchPrivileges(),
      table.fetchPolicies(),
    ]);
    this.error = table.columnsFetcher.error || table.privilegesFetcher.error || table.policiesFetcher.error;
  }).bind(this);

  setCurrentRole = flow(function* setCurrentRole({ roleName }) {
    this.currentRoleName = roleName;
  }).bind(this);

  setEditingConnectionName (connectionName) {
    this.editingConnectionName = connectionName;
  };

  getEditingConnection() {
    return this.connections[this.editingConnectionName];
  }

  get isFetched() {
    try {
      this.getCurrentTable().isFetched;
    } catch (error) {
      return false;
    }
  }
}

decorate(DbConnectionsManager, {
  currentConnectionName: observable,
  editingConnectionName: observable,
  currentSchemaName: observable,
  currentTableName: observable,
  currentRoleName: observable,
  connections: observable,
  connectionsNames: observable,
  addConnection: action.bound,
  addConnections: action.bound,
  getCurrentConnection: [boundMethod, computed],
  getCurrentSchema: [boundMethod, computed],
  getCurrentTable: [boundMethod, computed],
  getEditingConnection: [boundMethod, computed],
  isFetched: computed,
});

export default DbConnectionsManager;
