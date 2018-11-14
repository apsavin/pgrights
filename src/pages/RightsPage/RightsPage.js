import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { capitalize } from 'lodash';
import PanelGroup from 'react-panelgroup';
import withStyles from '@material-ui/core/styles/withStyles';
import type Router from '../../models/Router';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TableLargeIcon from 'mdi-material-ui/TableLarge';
import AccountOutlineIcon from 'mdi-material-ui/AccountOutline';
import ChevronDownIcon from 'mdi-material-ui/ChevronDown';
import Checkbox from '@material-ui/core/Checkbox';
import { AutoSizer, List as VirtualizedList } from 'react-virtualized';
import MuiTable from 'mui-virtualized-table';
import type DbConnectionsManager from '../../models/DbConnectionsManager';
import PageLayout from '../../components/PageLayout';
import Select from '../../components/Select';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      padding: theme.spacing.unit * 3,
    },
  },
  selectWrapper: {
    paddingBottom: theme.spacing.unit,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      paddingBottom: theme.spacing.unit,
    },
  },
  tableNameWrapper: {
    padding: 0,
  },
  tableName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sideWrapper: {
    height: '100vh',
    width: '100%',
    overflow: 'auto',
  },
  list: {
    height: '100%',
  },
  centerWrapper: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 2,
  },
});

type Props = {
  classes: $Call<typeof styles>,
  router: Router,
  dbConnectionsManager: DbConnectionsManager,
};

class RightsPage extends React.Component<Props> {
  panelWidths = [
    { size: 180, minSize: 100, resize: 'dynamic' },
    { minSize: 100, resize: 'stretch' },
    { size: 180, minSize: 100, resize: 'dynamic' },
  ];

  handleSchemaChange = (event) => {
    this.props.dbConnectionsManager.setCurrentSchema({ schemaName: event.target.value });
  };

  handleTableChange = (tableName) => {
    this.props.dbConnectionsManager.setCurrentTable({ tableName });
  };

  handleRoleChange = (roleName) => {
    this.props.dbConnectionsManager.setCurrentRole({ roleName });
  };

  handlePanelsUpdate = (panelWidths) => {
    this.panelWidths = panelWidths;
  };

  renderTables() {
    const { classes, dbConnectionsManager } = this.props;
    const { tablesNames, name: schemaName } = dbConnectionsManager.getCurrentSchema();
    const rowRenderer = ({ key, index, style }) => {
      const tableName = tablesNames[index];
      return (
        <ListItem
          dense
          button
          onClick={() => this.handleTableChange(tableName)}
          selected={tableName === dbConnectionsManager.currentTableName}
          key={key}
          style={style}
        >
          <ListItemIcon>
            <TableLargeIcon fontSize="small"/>
          </ListItemIcon>
          <Tooltip title={tableName}>
            <ListItemText
              primary={tableName}
              className={classes.tableNameWrapper}
              primaryTypographyProps={{ className: classes.tableName }}
            />
          </Tooltip>
        </ListItem>
      );
    };

    return <AutoSizer>{
      ({ width, height }) => (
        <VirtualizedList
          width={width}
          height={height}
          rowCount={tablesNames.length}
          rowHeight={40}
          rowRenderer={rowRenderer}
        />
      )
    }</AutoSizer>;
  }

  renderRoles() {
    const { classes, dbConnectionsManager } = this.props;

    return dbConnectionsManager.getCurrentConnection().rolesNames
      .map((roleName) => {
        return (
          <ListItem
            dense
            button
            onClick={() => this.handleRoleChange(roleName)}
            selected={roleName === dbConnectionsManager.currentRoleName}
            key={roleName + dbConnectionsManager.currentConnectionName}
          >
            <ListItemIcon>
              <AccountOutlineIcon fontSize="small"/>
            </ListItemIcon>
            <Tooltip title={roleName}>
              <ListItemText
                primary={roleName}
                className={classes.tableNameWrapper}
                primaryTypographyProps={{ className: classes.tableName }}
              />
            </Tooltip>
          </ListItem>
        );
      });
  }

  render() {
    const { classes, dbConnectionsManager } = this.props;
    const { schemasNames } = dbConnectionsManager.getCurrentConnection();
    const currentTable = dbConnectionsManager.getCurrentTable();
    const grantTypes = ['SELECT', 'UPDATE', 'DELETE', 'INSERT'];
    const grantedData = currentTable ? currentTable.columnsNames.map(columnName => {
      const column = dbConnectionsManager.getCurrentTable().columns[columnName];
      return {
        id: column.name,
        ...grantTypes.reduce((acc, type) => {
          const privilege = column.getPrivilege(dbConnectionsManager.currentRoleName, type);
          const checked = !!privilege;
          return {
            ...acc,
            [type]: checked,
          };
        }, {}),
      };
    }) : [];

    console.log(grantedData);

    return (
      <PageLayout>
        <PanelGroup
          panelWidths={this.panelWidths}
          spacing={1}
          borderColor="#ccc"
          panelColor="#fff"
          onUpdate={this.handlePanelsUpdate}
        >
          <Paper square elevation={0} className={classes.sideWrapper}>
            <Paper square elevation={0} className={`${classes.paper} ${classes.selectWrapper}`}>
              <Select
                value={dbConnectionsManager.currentSchemaName}
                name="schemas"
                label="Schema"
                dataForOptions={schemasNames}
                onChange={this.handleSchemaChange}
              />
            </Paper>
            <List className={classes.list}>
              {this.renderTables()}
            </List>
          </Paper>
          <Paper square elevation={0} className={classes.centerWrapper}>
            <ExpansionPanel defaultExpanded>
              <ExpansionPanelSummary expandIcon={<ChevronDownIcon/>}>
                <Typography variant="h4">
                  Granted permissions
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                {currentTable && (
                  <AutoSizer disableHeight>
                    {({ width }) => (
                      <MuiTable
                        data={grantedData}
                        columns={[
                          {
                            name: 'id',
                            header: 'Column',
                            cellProps: { padding: 'checkbox' },
                          },
                          ...grantTypes.map((type) => ({
                            name: 'type',
                            header: capitalize(type),
                            cell: (checked) => <Checkbox checked={checked}/>,
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
                )}
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel defaultExpanded>
              <ExpansionPanelSummary expandIcon={<ChevronDownIcon/>}>
                <Typography variant="h4">
                  Row level security
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Paper>
          <Paper square elevation={0} className={classes.sideWrapper}>
            <List>
              {this.renderRoles()}
            </List>
          </Paper>
        </PanelGroup>
      </PageLayout>
    );
  }
}

export default inject(({ dbConnectionsManager }) => ({
  dbConnectionsManager,
}))(withStyles(styles)(observer(RightsPage)));
