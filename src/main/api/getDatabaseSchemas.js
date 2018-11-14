import getCurrentConnection from '../db/getCurrentConnection';

const schemasInfoQuery = 'select * from information_schema.schemata';

function getDatabaseSchemas() {
  const db = getCurrentConnection();
  return db.query(schemasInfoQuery);
}

export default getDatabaseSchemas
