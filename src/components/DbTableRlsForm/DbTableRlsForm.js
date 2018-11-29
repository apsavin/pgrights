import * as React from 'react';
import { capitalize } from 'lodash';
import { observer } from 'mobx-react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import TableCell from '@material-ui/core/TableCell';
import Table from '../Table';
import DbConnectionsManager from '../../models/DbConnectionsManager';

const styles = theme => ({
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

function getPoliciesTableData(currentConnection, currentTable, roleName) {
  const role = currentConnection.roles[roleName];
  const policiesTableData = currentTable.policies.getPolicies(roleName);

  role.parents.forEach(parentRoleName => {
    const parentData = getPoliciesTableData(currentConnection, currentTable, parentRoleName);
    if (parentData.length) {
      policiesTableData.push(parentRoleName);
      policiesTableData.push(...parentData);
    }
  });

  return policiesTableData;
}

class DbTableRlsForm extends React.Component<Props> {

  render() {
    const { dbConnectionsManager, classes } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    const currentConnection = dbConnectionsManager.getCurrentConnection();
    const { currentRoleName: roleName } = dbConnectionsManager;
    const policiesTableData = currentTable ? getPoliciesTableData(currentConnection, currentTable, roleName) : [];
    const columns = [
      {
        name: 'name',
        header: <Typography variant="h6">Name</Typography>,
        cell: ({ name }) => (
          <Tooltip title={name}>
            <Typography variant="body2" noWrap>{name}</Typography>
          </Tooltip>
        ),
      },
      {
        name: 'permissive',
        header: <Typography variant="h6">Permissive</Typography>,
        cellProps: { padding: 'checkbox' },
        cell: (row) => <Checkbox checked={row.permissive}/>,
      },
      {
        name: 'command',
        header: <Typography variant="h6">Command</Typography>,
      },
      {
        name: 'qualifier',
        header: <Typography variant="h6">Qualifier</Typography>,
        cell: ({ qualifier }) => (
          <Tooltip title={qualifier}>
            <Typography variant="body2" noWrap>{qualifier}</Typography>
          </Tooltip>
        ),
      },
      {
        name: 'check',
        header: <Typography variant="h6">With check</Typography>,
        cell: ({ check }) => (
          <Tooltip title={check}>
            <Typography variant="body2" noWrap>{check}</Typography>
          </Tooltip>
        ),
      },
    ];

    return (
      <Table data={policiesTableData} columns={columns} rowRenderer={(tableRow) => {
        if (typeof tableRow === 'string') {
          return (
            <TableCell colSpan={columns.length}>
              Inherited from <b>{tableRow}</b>
            </TableCell>
          );
        }
        return (
          <React.Fragment>
            {columns.map(column => {
              const { cell = (data) => data[column.name] } = column;
              return (
                <TableCell>{cell(tableRow)}</TableCell>
              );
            })}
          </React.Fragment>
        );
      }}/>
    );
  }
}

export default withStyles(styles)(observer(DbTableRlsForm));
