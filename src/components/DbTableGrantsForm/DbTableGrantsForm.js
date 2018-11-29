import * as React from 'react';
import { capitalize } from 'lodash';
import { observer } from 'mobx-react';
import { Column, Table, AutoSizer } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import TableCell from '@material-ui/core/TableCell';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import { dbColumnPrivilegeTypes } from '../../models/DbColumn';
import { dbTablePrivilegeTypes } from '../../models/DbTable';

const styles = theme => ({});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

function headerRenderer({ dataKey, label }) {
  return (
    <TableCell component="div" variant="head" padding="checkbox" style={{
      flexGrow: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'flex',
      alignItems: 'center',
    }}>
      <Typography variant="h6">{label}</Typography>
    </TableCell>
  );
}

const checkboxRenderer = ({ cellData }) => (
  <TableCell component="div" variant="body" padding="checkbox" style={{ flexGrow: 1 }}>
    <Checkbox checked={cellData}/>
  </TableCell>
);
const columnRenderer = ({ cellData }) => (
  <TableCell component="div" variant="body" padding="checkbox" style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
    <Typography variant="body1" style={{ flexGrow: 1 }}>{cellData}</Typography>
  </TableCell>
);

class DbTableGrantsForm extends React.Component<Props> {

  render() {
    const { dbConnectionsManager } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    const grantee = dbConnectionsManager.currentRoleName;
    const grantedData = currentTable ? currentTable.columnsNames.map(columnName => {
      const column = currentTable.columns[columnName];
      return {
        name: column.name,
        ...dbColumnPrivilegeTypes.reduce((acc, type) => {
          const privilege = column.privileges.get(grantee, type);
          return {
            ...acc,
            [type]: !!privilege,
          };
        }, {}),
      };
    }) : [];

    const heightOfCell = 49;
    const totalHeight = grantedData.length * heightOfCell;
    const height = totalHeight > 500 ? 500 : totalHeight;

    return (
      <React.Fragment>
        <div><Typography variant="h6">
          {dbTablePrivilegeTypes.map(type => {
            return (
              <React.Fragment key={type}>
                {capitalize(type)}:&nbsp;<Checkbox checked={!!(currentTable && currentTable.privileges.get(grantee, type))}/>
              </React.Fragment>
            );
          })}</Typography>
        </div>
        <Divider />
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              width={width}
              height={height}
              headerHeight={56}
              rowHeight={heightOfCell}
              rowCount={grantedData.length}
              rowGetter={({ index }) => grantedData[index]}
              rowStyle={{ display: 'flex' }}
            >
              <Column
                dataKey="name"
                label="Column"
                width={100}
                flexGrow={1}
                headerRenderer={headerRenderer}
                cellRenderer={columnRenderer}
                style={{ display: 'flex' }}
                headerStyle={{ display: 'flex', minWidth: '0px' }}
              />
              {dbColumnPrivilegeTypes.map(type => (
                <Column
                  dataKey={type}
                  label={capitalize(type)}
                  width={100}
                  headerRenderer={headerRenderer}
                  cellRenderer={checkboxRenderer}
                  style={{ display: 'flex' }}
                  headerStyle={{ display: 'flex', minWidth: '0px' }}
                />
              ))}
            </Table>
          )}
        </AutoSizer>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(observer(DbTableGrantsForm));
