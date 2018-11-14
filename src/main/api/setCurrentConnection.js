import { config } from '../db/connections';

function setCurrentConnection({ name }) {
  config.currentConnectionName = name;
}

export default setCurrentConnection
