import * as React from 'react';
import { observer } from 'mobx-react';
import withStyles from '@material-ui/core/styles/withStyles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import TableCell from '@material-ui/core/TableCell';
import CheckIcon from 'mdi-material-ui/Check';
import Table from '../Table';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import Progress from '../Progress';
import DbPolicy from '../../models/DbPolicy';
import DbPolicyDialogForm from '../DbPolicyDialogForm';

const styles = (theme) => ({
  progress: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  tableRlsWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing.unit * 2,
  },
  tableRlsLabel: {
    paddingRight: theme.spacing.unit,
  },
  clickableCell: {
    cursor: 'pointer',
  },
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

function getPoliciesTableData(currentConnection, currentTable, roleName) {
  const role = currentConnection.roles[roleName];
  const policiesTableData = [...currentTable.policies.getPolicies(roleName)];

  role.parents.forEach(parentRoleName => {
    const parentData = getPoliciesTableData(currentConnection, currentTable, parentRoleName);
    if (parentData.length) {
      policiesTableData.push(parentRoleName);
      policiesTableData.push(...parentData);
    }
  });

  return policiesTableData;
}

type State = {
  openPolicyDialog: boolean,
  openedPolicy: DbPolicy | null,
};

class DbTableRlsForm extends React.Component<Props, State> {

  state = {
    openPolicyDialog: false,
    openedPolicy: null,
  };

  renderNoRows = () => {
    const { dbConnectionsManager, classes } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    if (!currentTable || !currentTable.policiesFetcher.inSuccessState) {
      return <div className={classes.progress}><Progress/></div>;
    }

    return <Typography variant="subtitle2" align="center">No policies found</Typography>;
  };

  handlePolicyClick(policy: DbPolicy) {
    this.setState({
      openPolicyDialog: true,
      openedPolicy: policy,
    });
  };

  handlePolicyDialogClose = () => {
    this.setState({
      openPolicyDialog: false,
      openedPolicy: null,
    });
  };

  render() {
    const { dbConnectionsManager, classes } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    const currentConnection = dbConnectionsManager.getCurrentConnection();
    const { currentRoleName: roleName } = dbConnectionsManager;
    let policiesTableData = [];
    if (currentTable) {
      const publicRole = 'public';
      const publicPolicies = currentTable.policies.getPolicies(publicRole);
      policiesTableData = [
        ...getPoliciesTableData(currentConnection, currentTable, roleName),
        ...publicPolicies.length ? [
          publicRole,
          ...publicPolicies,
        ] : [],
      ];
    }
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
        cell: (row) => (row.permissive ? <CheckIcon /> : null),
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
        header: <Typography variant="h6">Check</Typography>,
        cell: ({ check }) => (
          <Tooltip title={check || '–'}>
            <Typography variant="body2" noWrap>{check || '–'}</Typography>
          </Tooltip>
        ),
      },
    ];

    const isRlsEnabled = currentTable && currentTable.isRlsEnabled;

    return (
      <React.Fragment>
        <div className={classes.tableRlsWrapper}>
          <Typography variant="h6" className={classes.tableRlsLabel}>Table:</Typography>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={isRlsEnabled}/>}
              label={`Row-level security ${isRlsEnabled ? 'enabled' : 'disabled'}`}
            />
          </FormGroup>
        </div>
        <Divider/>
        <Table
          data={policiesTableData}
          columns={columns}
          rowRenderer={(tableRow) => {
            if (typeof tableRow === 'string') {
              return (
                <TableCell colSpan={columns.length}>
                  Inherited from <b>{tableRow}</b>
                </TableCell>
              );
            }

            const handlePolicyClick = this.handlePolicyClick.bind(this, tableRow);
            return columns.map(column => {
              const { cell = (data) => data[column.name] } = column;
              return (
                <TableCell
                  key={column.name}
                  className={classes.clickableCell}
                  onClick={handlePolicyClick}
                >
                  {cell(tableRow)}
                </TableCell>
              );
            });
          }}
          rowKey={(tableRow, i) => `${tableRow.name || tableRow}_${i}`}
          noRowsRenderer={this.renderNoRows}
        />
        <DbPolicyDialogForm
          open={this.state.openPolicyDialog}
          policy={this.state.openedPolicy}
          onClose={this.handlePolicyDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(observer(DbTableRlsForm));
