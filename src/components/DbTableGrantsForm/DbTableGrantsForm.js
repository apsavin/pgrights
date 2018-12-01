import * as React from 'react';
import { capitalize } from 'lodash';
import { observer } from 'mobx-react';
import { Column, Table, AutoSizer } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import TableCell from '@material-ui/core/TableCell';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import { dbColumnPrivilegeTypes } from '../../models/DbColumn';
import { dbTablePrivilegeTypes } from '../../models/DbTable';
import Progress from '../Progress';

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
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
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

  checkboxRenderer = ({ cellData }) => {
    const { classes } = this.props;
    return (
      <TableCell component="div" variant="body" padding="checkbox" className={classes.checkboxCell}>
        <Checkbox checked={cellData}/>
      </TableCell>
    );
  };

  renderNoRows = () => {
    const { dbConnectionsManager, classes } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    if (!currentTable.privilegesFetcher.inSuccessState || !currentTable.columnsFetcher.inSuccessState) {
      return <div className={classes.progress}><Progress/></div>;
    }

    return <Typography variant="h6" align="center">No columns found</Typography>;
  };

  render() {
    const { dbConnectionsManager, classes } = this.props;
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
    const headerHeight = 56;
    const totalHeight = grantedData.length * heightOfCell;
    const height = ((totalHeight > 500 ? 500 : totalHeight) || 86) + headerHeight;

    return (
      <React.Fragment>
        <div className={classes.tableGrantsWrapper}>
          <Typography variant="h6" className={classes.tableGrantsLabel}>Table:</Typography>
          <FormGroup row>
            {dbTablePrivilegeTypes.map(type => {
              return (
                <FormControlLabel
                  key={type}
                  control={<Checkbox checked={!!(currentTable && currentTable.privileges.get(grantee, type))}/>}
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
              rowCount={grantedData.length}
              rowGetter={({ index }) => grantedData[index]}
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
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(observer(DbTableGrantsForm));
