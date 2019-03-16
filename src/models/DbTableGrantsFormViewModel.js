import { keys, flow } from 'mobx';
import { formatQuery } from 'pg-promise/lib/formatting';
import type DbConnectionsManager from './DbConnectionsManager';
import { dbTablePrivilegeTypes } from './DbTable';
import { dbColumnPrivilegeTypes } from './DbColumn';
import FormViewModel from './FormViewModel';
import Fetcher from './Fetcher';

class DbTableGrantsFormViewModel extends FormViewModel {
  constructor(dbConnectionsManager: DbConnectionsManager) {
    const fieldsConfig = DbTableGrantsFormViewModel.createFormFieldsConfig(dbConnectionsManager);
    super(fieldsConfig);
    this.currentTable = dbConnectionsManager.getCurrentTable();
  }

  fetch = flow(function * fetch() {
    const fetcher = new Fetcher({
      fetch: () => {
        return this.currentTable.db.tx(async t => {
          const { schemaName, name: tableName } = this.currentTable;

          const queries = keys(this.localValues).map((key) => {
            const enabled = this.localValues.get(key);
            const { scope, columnName, grantee, type } = this.fieldsConfig[key].getDescription();
            if (scope === 'table') {
              const query = enabled
                ? 'grant $(type:raw) on $(schemaName:name).$(tableName:name) to $(grantee:name);'
                : 'revoke $(type:raw) on $(schemaName:name).$(tableName:name) from $(grantee:name);';
              return formatQuery(query, { type, schemaName, tableName, grantee });
            }

            const query = enabled
              ? 'grant $(type:raw) ($(columnName:name)) on $(schemaName:name).$(tableName:name) to $(grantee:name);'
              : 'revoke $(type:raw) ($(columnName:name)) on $(schemaName:name).$(tableName:name) from $(grantee:name);';
            return formatQuery(query, { type, schemaName, tableName, grantee, columnName });
          });

          for (let query of queries) {
            await t.none(query);
          }
        });
      },
    });

    yield fetcher.fetch();

    this.submit();

    return fetcher;
  });

  static createFormFieldsConfig(dbConnectionsManager: DbConnectionsManager) {
    const currentTable = dbConnectionsManager.getCurrentTable();

    if (!currentTable) {
      return {};
    }

    const grantee = dbConnectionsManager.currentRoleName;
    const { user: grantor } = dbConnectionsManager.getCurrentConnection();

    let fieldsConfig = dbTablePrivilegeTypes.reduce((acc, type) => {
      return {
        ...acc,
        [type]: {
          get: () => !!(currentTable.privileges.get(grantee, type)),
          set: (value) => {
            if (value) {
              currentTable.privileges.add({
                grantor,
                grantee,
                type,
                isGrantable: false,
                withHierarchy: false,
              });
            }
            else {
              currentTable.privileges.remove(grantee, type);
            }
          },
          getDescription: () => ({ type, grantee, scope: 'table' }),
        },
      };
    }, {});

    currentTable.columnsNames.forEach((columnName, rowIndex) => {
      const column = currentTable.columns[columnName];
      fieldsConfig = dbColumnPrivilegeTypes.reduce((acc, type) => {
        const privilege = column.privileges.get(grantee, type);
        return {
          ...acc,
          [`${type}_${rowIndex}`]: {
            get: () => !!privilege,
            set: (value) => {
              if (value) {
                column.privileges.add({
                  grantor,
                  grantee,
                  type,
                  isGrantable: false,
                });
              }
              else {
                column.privileges.remove(grantee, type);
              }
            },
            getDescription: () => ({ type, grantee, columnName, scope: 'column' }),
          },
        };
      }, fieldsConfig);
    });

    return fieldsConfig;
  }
}

export default DbTableGrantsFormViewModel;
