import { decorate, observable, flow } from 'mobx';
import DbTable from './DbTable';

class DbSchema {
  constructor({ name, db }) {
    this.name = name;
    this.db = db;
    this.tables = {};
    this.tablesNames = [];
  }

  fetchTables = flow(function* fetchTables() {
    const schemaName = this.name;
    const { db } = this;
    const tables = yield db.query(
      'select t.* from information_schema.tables as t where t.table_schema = $(schemaName) order by t.table_name;',
      { schemaName },
    );

    this.tables = {};
    this.tablesNames = [];

    tables.forEach(({ table_name: name }) => {
      this.tablesNames.push(name);
      this.tables[name] = new DbTable({ name, db, schemaName });
    });
  });
}

decorate(DbSchema, {
  tables: observable,
  tablesNames: observable,
});

export default DbSchema;
