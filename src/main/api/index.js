import createConnection from './createConnection';
import getSchemaTables from './getSchemaTables';
import getTableColumnsPrivileges from './getTableColumnsPrivileges';
import getRoles from './getRoles';
import getDatabaseSchemas from './getDatabaseSchemas';
import setCurrentConnection from './setCurrentConnection';
import apiActions from '../../constants/apiActions';

const map = {
  [apiActions.createConnection]: createConnection,
  [apiActions.getSchemaTables]: getSchemaTables,
  [apiActions.getTableColumnsPrivileges]: getTableColumnsPrivileges,
  [apiActions.getRoles]: getRoles,
  [apiActions.getDatabaseSchemas]: getDatabaseSchemas,
  [apiActions.setCurrentConnection]: setCurrentConnection,
};

export default map;
