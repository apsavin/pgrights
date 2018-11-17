import * as React from 'react';
import { capitalize } from 'lodash';
import { observer } from 'mobx-react';
import { AutoSizer } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import MuiTable from 'mui-virtualized-table';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import { dbColumnPrivilegeTypes } from '../../models/DbColumn';
import { dbTablePrivilegeTypes } from '../../models/DbTable';

const styles = theme => ({
  tableNameWrapper: {
    padding: 0,
  },
  tableName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  list: {
    height: '100%',
  },
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

class DbTableGrantsForm extends React.Component<Props> {

  render() {
    const { dbConnectionsManager } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    const grantee = dbConnectionsManager.currentRoleName;
    const grantedData = currentTable ? currentTable.columnsNames.map(columnName => {
      const column = currentTable.columns[columnName];
      return {
        id: column.name,
        ...dbColumnPrivilegeTypes.reduce((acc, type) => {
          const privilege = column.privileges.get(grantee, type);
          return {
            ...acc,
            [type]: !!privilege,
          };
        }, {}),
      };
    }) : [];

    return (
      <React.Fragment>
        <div>
          {dbTablePrivilegeTypes.map(type => {
            return (
              <React.Fragment key={type}>
                {type}:
                <Checkbox checked={!!currentTable.privileges.get(grantee, type)}/>
              </React.Fragment>
            );
          })}
        </div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <MuiTable
              data={grantedData}
              columns={[
                {
                  name: 'id',
                  header: <Typography variant="h6">Column</Typography>,
                  cellProps: { padding: 'checkbox' },
                },
                ...dbColumnPrivilegeTypes.map((type) => ({
                  name: 'type',
                  header: <Typography variant="h6">{capitalize(type)}</Typography>,
                  cell: (row) => <Checkbox checked={row[type]}/>,
                  cellProps: { padding: 'checkbox' },
                })),
              ]}
              width={width}
              maxHeight={500}
              fixedRowCount={1}
              includeHeaders
            />
          )}
        </AutoSizer>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(observer(DbTableGrantsForm));
