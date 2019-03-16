import * as React from 'react';
import { observer } from 'mobx-react';
import { createViewModel } from 'mobx-utils/lib/create-view-model';
import withStyles from '@material-ui/core/styles/withStyles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import CheckIcon from 'mdi-material-ui/Check';
import flowRight from 'lodash/flowRight';
import Table from '../Table';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import Progress from '../Progress';
import DbPolicy from '../../models/DbPolicy';
import DbPolicyDialogForm from '../DbPolicyDialogForm';
import withFetch from '../../hocs/withFetch';

const styles = (theme) => ({
  progress: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  tableRlsWrapper: {
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
  runToggleRlsForce: () => Promise<{ error: Error | null }>,
  toggleRlsForceInProgress: boolean,
  showToggleRlsForceLoader: boolean,
  runToggleRls: () => Promise<{ error: Error | null }>,
  toggleRlsInProgress: boolean,
  showToggleRlsLoader: boolean,
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

  getCurrentTableViewModel() {
    const { dbConnectionsManager } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();

    if (!currentTable) {
      return null;
    }

    if (!this.currentTableViewModel) {
      this.currentTableViewModel = createViewModel(currentTable);
    }

    if (this.currentTableViewModel.model !== currentTable) {
      this.currentTableViewModel.model = currentTable;
    }

    return this.currentTableViewModel;
  }

  renderNoRows = () => {
    const { classes } = this.props;
    const currentTable = this.getCurrentTableViewModel();
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

  handleRlsEnabledChange = () => {
    const currentTable = this.getCurrentTableViewModel();
    if (!currentTable) {
      return;
    }

    currentTable.isRlsEnabled = !currentTable.isRlsEnabled;
  };

  handleRlsEnabledSave = async () => {
    const currentTable = this.getCurrentTableViewModel();
    if (!currentTable || this.props.toggleRlsInProgress) {
      return;
    }

    const { error } = await this.props.runToggleRls(() => currentTable.model.toggleRls());
    if (!error) {
      currentTable.resetProperty('isRlsEnabled');
    }
  };

  handleRlsForcedChange = () => {
    const currentTable = this.getCurrentTableViewModel();
    if (!currentTable) {
      return;
    }

    currentTable.isRlsForced = !currentTable.isRlsForced;
  };

  handleRlsForcedSave = async () => {
    const currentTable = this.getCurrentTableViewModel();
    if (!currentTable) {
      return;
    }

    const { error } = await this.props.runToggleRlsForce(() => currentTable.model.toggleRlsForce());
    if (!error) {
      currentTable.resetProperty('isRlsForced');
    }
  };

  render() {
    const { dbConnectionsManager, classes } = this.props;
    const currentTable = this.getCurrentTableViewModel();
    const currentConnection = dbConnectionsManager.getCurrentConnection();
    const { currentRoleName: roleName } = dbConnectionsManager;
    const currentRole = currentConnection.roles[roleName];

    if (currentRole.bypassRLS) {
      return (
        <Typography variant="h6" className={classes.tableGrantsLabel}>Selected role bypasses RLS</Typography>
      );
    }

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
    const isRlsForced = currentTable && currentTable.isRlsForced;

    return (
      <React.Fragment>
        <div className={classes.tableRlsWrapper}>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={isRlsEnabled} onChange={this.handleRlsEnabledChange}/>}
              label={`Row-level security is ${isRlsEnabled ? 'enabled' : 'disabled'}`}
            />
            {currentTable && currentTable.isPropertyDirty('isRlsEnabled') && (
              <Button
                color="primary"
                variant="text"
                onClick={this.handleRlsEnabledSave}
              >
                Save
              </Button>
            )}
          </FormGroup>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={isRlsForced} onChange={this.handleRlsForcedChange}/>}
              label={`Row-level security is ${isRlsForced ? 'forced' : 'not forced'}`}
            />
            {currentTable && currentTable.isPropertyDirty('isRlsForced') && (
              <Button
                color="primary"
                variant="text"
                onClick={this.handleRlsForcedSave}
              >
                Save
              </Button>
            )}
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

const enhance = flowRight(
  withFetch({
    fetch: 'runToggleRlsForce',
    inProgress: 'toggleRlsForceInProgress',
    showLoader: 'showToggleRlsForceLoader',
  }, {
    showSuccessSnackbar: true,
    successSnackbarText: 'RLS force altered successfully'
  }),
  withFetch({
    fetch: 'runToggleRls',
    inProgress: 'toggleRlsInProgress',
    showLoader: 'showToggleRlsLoader',
  }, {
    showSuccessSnackbar: true,
    successSnackbarText: 'RLS altered successfully'
  }),
  withStyles(styles),
  observer,
);
export default enhance(DbTableRlsForm);
