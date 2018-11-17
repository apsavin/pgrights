import { decorate, observable, flow, action, computed } from 'mobx';
import { boundMethod } from 'autobind-decorator'
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
  }

  addConnection(connectionData: TDbConnectionData) {
    const connection = new DbConnection(connectionData);
    this.connections[connection.name] = connection;
    this.connectionsNames.push(connection.name);
  }

  addConnections(connectionsData) {
    Object.keys(connectionsData).forEach(key => {
      this.addConnection(connectionsData[key]);
    });
  }

  getCurrentConnection(): DbConnection {
    return this.connections[this.currentConnectionName];
  }

  connect = flow(function* connect({ connectionName }) {
    this.currentConnectionName = connectionName;
    const connection = this.getCurrentConnection();
    yield connection.fetchSchemas();
    yield connection.fetchRoles();
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
    yield schema.fetchTables();
    yield this.setCurrentTable({ tableName: schema.tablesNames[0] });
  }).bind(this);

  getCurrentTable(): DbTable {
    return this.getCurrentSchema().tables[this.currentTableName];
  }

  setCurrentTable = flow(function* setCurrentTable({ tableName }) {
    this.currentTableName = tableName;
    const table = this.getCurrentTable();
    yield Promise.all([
      table.fetchColumns(),
      table.fetchPrivileges(),
      table.fetchPolicies(),
    ]);
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
});

export default DbConnectionsManager;
