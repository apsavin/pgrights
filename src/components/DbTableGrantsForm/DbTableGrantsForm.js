import * as React from 'react';
import { capitalize, flowRight } from 'lodash';
import { inject, observer } from 'mobx-react';
import { Column, Table, AutoSizer } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import TableCell from '@material-ui/core/TableCell';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import { dbColumnPrivilegeTypes } from '../../models/DbColumn';
import { dbTablePrivilegeTypes } from '../../models/DbTable';
import Progress from '../Progress';
import DbTableGrantsFormViewModel from '../../models/DbTableGrantsFormViewModel';
import CheckboxField from '../formViewModel/CheckboxField';
import ResetButton from '../formViewModel/ResetButton';
import SubmitButton from '../formViewModel/SubmitButton';
import withFetch, { defaultMap } from '../../hocs/withFetch';

const styles = (theme) => ({
  progress: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  tableGrantsWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing.unit * 2,
  },
  tableGrantsLabel: {
    paddingRight: theme.spacing.unit,
  },
  headerCell: {
    flexGrow: 1,
    display: 'flex',
    overflow: 'hidden',
    alignItems: 'center',
  },
  headerText: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  columnCell: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1
  },
  checkboxCell: {
    flexGrow: 1,
  },
  buttons: {
    marginTop: theme.spacing.unit * 2,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  submit: {
    marginRight: theme.spacing.unit,
  },
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
  formViewModel: DbTableGrantsFormViewModel,
  inProgress: boolean,
  showLoader: boolean,
  fetch: () => Promise<{ error: Error | null }>
};

const rowStyle= { display: 'flex' };
const columnStyle = { display: 'flex' };
const headerStyle = { display: 'flex', minWidth: '0px' };

class DbTableGrantsForm extends React.Component<Props> {

  headerRenderer = ({ dataKey, label }) => {
    const { classes } = this.props;
    return (
      <TableCell component="div" variant="head" padding="checkbox" className={classes.headerCell}>
        <Tooltip title={label}>
          <Typography variant="h6" className={classes.headerText}>
            {label}
          </Typography>
        </Tooltip>
      </TableCell>
    );
  };

  columnRenderer = ({ cellData }) => {
    const { classes } = this.props;
    return (
      <TableCell component="div" variant="body" padding="checkbox" className={classes.columnCell}>
        <Typography variant="body1" style={{ flexGrow: 1 }}>{cellData}</Typography>
      </TableCell>
    );
  };

  checkboxRenderer = ({ dataKey: type, rowIndex }) => {
    const { classes, formViewModel } = this.props;
    return (
      <TableCell component="div" variant="body" padding="checkbox" className={classes.checkboxCell}>
        <CheckboxField name={`${type}_${rowIndex}`} formViewModel={formViewModel} />
      </TableCell>
    );
  };

  renderNoRows = () => {
    const { dbConnectionsManager, classes } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    if (!currentTable || !currentTable.privilegesFetcher.inSuccessState || !currentTable.columnsFetcher.inSuccessState) {
      return <div className={classes.progress}><Progress/></div>;
    }

    return <Typography variant="h6" align="center">No columns found</Typography>;
  };

  rowGetter = ({ index }) => {
    const { dbConnectionsManager } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    if (!currentTable) {
      return {};
    }
    return {
      name: currentTable.columnsNames[index],
    };
  };

  submit = (event) => {
    event.preventDefault();

    const { inProgress, fetch, formViewModel } = this.props;
    if (inProgress) {
      return;
    }

    fetch(() => formViewModel.fetch());
  };

  handleTablePrivilegeChange = ({ name: type, value: enabled }) => {
    const { dbConnectionsManager, formViewModel } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    if (!currentTable) {
      return;
    }
    // enabled for table === enabled for all columns, but disabled for table !== disabled for all columns
    if (!enabled) {
      return;
    }
    const { columnsNames } = currentTable;
    columnsNames.forEach((name, i) => {
      formViewModel[`${type}_${i}`] = enabled;
    });
  };

  render() {
    const { dbConnectionsManager, classes, showLoader, formViewModel } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    const grantee = dbConnectionsManager.currentRoleName;

    if (dbConnectionsManager.getCurrentConnection().roles[grantee].isSuperUser) {
      return (
        <Typography variant="h6" className={classes.tableGrantsLabel}>
          Selected role is SUPERUSER and bypasses permissions
        </Typography>
      );
    }

    const rowCount = currentTable ? currentTable.columnsNames.length : 0;
    const heightOfCell = 49;
    const headerHeight = 56;
    const totalHeight = rowCount * heightOfCell;
    const height = ((totalHeight > 500 ? 500 : totalHeight) || 86) + headerHeight;

    return (
      <form onSubmit={this.submit}>
        <div className={classes.tableGrantsWrapper}>
          <Typography variant="h6" className={classes.tableGrantsLabel}>Table:</Typography>
          <FormGroup row>
            {dbTablePrivilegeTypes.map(type => {
              return (
                <FormControlLabel
                  key={type}
                  control={<CheckboxField
                    formViewModel={formViewModel}
                    name={type}
                    onChange={this.handleTablePrivilegeChange}
                  />}
                  label={capitalize(type)}
                />
              );
            })}
          </FormGroup>
        </div>
        <Divider/>
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              width={width}
              height={height}
              headerHeight={headerHeight}
              rowHeight={heightOfCell}
              rowCount={rowCount}
              rowGetter={this.rowGetter}
              rowStyle={rowStyle}
              noRowsRenderer={this.renderNoRows}
            >
              <Column
                key="name"
                dataKey="name"
                label="Column"
                width={100}
                flexGrow={2}
                headerRenderer={this.headerRenderer}
                cellRenderer={this.columnRenderer}
                style={columnStyle}
                headerStyle={headerStyle}
              />
              {dbColumnPrivilegeTypes.map(type => (
                <Column
                  key={type}
                  dataKey={type}
                  label={capitalize(type)}
                  width={100}
                  flexGrow={1}
                  headerRenderer={this.headerRenderer}
                  cellRenderer={this.checkboxRenderer}
                  style={columnStyle}
                  headerStyle={headerStyle}
                />
              ))}
            </Table>
          )}
        </AutoSizer>
        <div className={classes.buttons}>
          <SubmitButton formViewModel={formViewModel} showLoader={showLoader} className={classes.submit} />
          <ResetButton formViewModel={formViewModel} />
        </div>
      </form>
    );
  }
}

const enhance = flowRight(
  inject(({ dbConnectionsManager }) => ({
    dbConnectionsManager,
    formViewModel: new DbTableGrantsFormViewModel(dbConnectionsManager),
  })),
  withFetch(defaultMap, {
    showSuccessSnackbar: true,
    successSnackbarText: 'Changes saved successfully'
  }),
  observer,
  withStyles(styles),
);
export default enhance(DbTableGrantsForm);
