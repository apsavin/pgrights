import getCurrentConnection from '../db/getCurrentConnection';

const columnsInfoQuery = `
  select * from information_schema.column_privileges as cp
           where cp.table_schema = $(schemaName) and cp.table_name = $(tableName);
`;

function getTableColumnsPrivileges({ schemaName = 'public', tableName } = {}) {
  const db = getCurrentConnection();
  return db.query(columnsInfoQuery, { schemaName, tableName });
}

export default getTableColumnsPrivileges;
