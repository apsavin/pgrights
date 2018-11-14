import getCurrentConnection from '../db/getCurrentConnection';

const tablesInfoQuery = `
  select t.* from information_schema.tables as t where t.table_schema = $(schemaName)
  order by t.table_name;
`;

function getSchemaTables({ schemaName = 'public' } = {}) {
  const db = getCurrentConnection();
  return db.query(tablesInfoQuery, { schemaName });
}

export default getSchemaTables;
