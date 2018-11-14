import { config } from './connections';
import persistentStorage from '../../persistentStorage';
import connections from './connections';
import pgp from './pgp';

export default function () {
  const name = config.currentConnectionName;

  if (!connections[name]) {
    connections[name] = pgp(persistentStorage.store.connections[name]);
  }

  return connections[name];
}
