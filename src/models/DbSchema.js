import { decorate, observable, flow } from 'mobx';
import DbTable from './DbTable';
import Fetcher from './Fetcher';

class DbSchema {
  constructor({ name, db }) {
    this.name = name;
    this.db = db;
    this.tables = {};
    this.tablesNames = [];
    this.tablesFetcher = new Fetcher({
      fetch() {
        return db.query(
          'select t.* from information_schema.tables as t where t.table_schema = $(schemaName) order by t.table_name;',
          { schemaName: name },
        );
      }
    });
  }

  fetchTables = flow(function* fetchTables() {
    const schemaName = this.name;
    const { db } = this;
    yield this.tablesFetcher.fetch();

    if (!this.tablesFetcher.inSuccessState) {
      return;
    }

    this.tables = {};
    this.tablesNames = [];

    const tables = this.tablesFetcher.result;

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
