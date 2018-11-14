import connections from '../db/connections';
import pgp from '../db/pgp';
import config from '../../persistentStorage';

function createConnection(data) {
  if (connections[data.name]) {
    return;
  }
  connections[data.name] = pgp(data);
  config.set('connections', {
    ...(config.get('connections') || {}),
    [data.name]: data,
  });
}

export default createConnection;
