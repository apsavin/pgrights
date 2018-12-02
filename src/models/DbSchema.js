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
          `select t.* from pg_catalog.pg_tables as t 
           where t.schemaname = $(schemaName) order by t.tablename;`,
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

    tables.forEach(({ tablename: name, rowsecurity: isRlsEnabled }) => {
      this.tablesNames.push(name);
      this.tables[name] = new DbTable({ name, isRlsEnabled, db, schemaName });
    });
  });
}

decorate(DbSchema, {
  tables: observable,
  tablesNames: observable,
});

export default DbSchema;
