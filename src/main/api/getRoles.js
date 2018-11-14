import getCurrentConnection from '../db/getCurrentConnection';

const rolesInfoQuery = `
  select * from pg_catalog.pg_roles order by rolname;
`;

function getSchemaTables() {
  const db = getCurrentConnection();
  return db.query(rolesInfoQuery);
}

export default getSchemaTables;
