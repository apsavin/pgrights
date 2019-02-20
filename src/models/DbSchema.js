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
          `select c.relname             as "name",
                  c.relrowsecurity      as "isRlsEnabled",
                  c.relforcerowsecurity as "isRlsForced"
             from pg_class c left join pg_namespace n on n.oid = c.relnamespace
             where c.relkind = any (array['r'::"char", 'p'::"char"])
                  and n.nspname = $(schemaName) 
            order by c.relname;`,
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

    tables.forEach(({ name, isRlsEnabled, isRlsForced }) => {
      this.tablesNames.push(name);
      this.tables[name] = new DbTable({ name, isRlsEnabled, isRlsForced, db, schemaName });
    });
  });
}

decorate(DbSchema, {
  tables: observable,
  tablesNames: observable,
});

export default DbSchema;
