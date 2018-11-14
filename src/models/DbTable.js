import { decorate, observable, flow } from 'mobx';
import apiActions from '../constants/apiActions';
import { sendRequest } from '../utils/api';
import DbColumn from './DbColumn';

class DbTable {
  constructor({ name, connectionName, schemaName }) {
    this.name = name;
    this.connectionName = connectionName;
    this.schemaName = schemaName;
    this.columns = {};
    this.columnsNames = [];
  }

  fetchColumns = flow(function* fetchColumns() {
    const { name: tableName, schemaName, connectionName } = this;
    const data = { schemaName, tableName };
    const columnsPrivileges = yield sendRequest({ action: apiActions.getTableColumnsPrivileges, data });

    this.columns = {};
    this.columnsNames = [];

    columnsPrivileges.forEach((privelegeData) => {
      const {
        column_name: name,
        grantor,
        grantee,
        privilege_type: type,
        is_grantable
      } = privelegeData;
      if (!this.columns[name]) {
        this.columnsNames.push(name);
        this.columns[name] = new DbColumn({ name, connectionName, schemaName, tableName });
      }
      const isGrantable = is_grantable === 'YES';
      this.columns[name].addPrivilege({ name, grantor, grantee, type, isGrantable });
    });
  });
}

decorate(DbTable, {
  columns: observable,
  columnsNames: observable,
});

export default DbTable;
