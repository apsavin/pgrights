import * as React from 'react';
import { observer } from 'mobx-react';
import { AutoSizer, List as VirtualizedList } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TableLargeIcon from 'mdi-material-ui/TableLarge';
import Tooltip from '@material-ui/core/Tooltip';
import Select from '../Select';
import DbConnectionsManager from '../../models/DbConnectionsManager';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      padding: theme.spacing.unit * 3,
    },
  },
  selectWrapper: {
    marginTop: '8px',
  },
  select: {
    width: '100%',
  },
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
  listItem: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingTop: 0,
    paddingBottom: 0,
  },
  listItemIcon: {
    marginRight: theme.spacing.unit,
  }
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

class DbTablePicker extends React.Component<Props> {

  handleSchemaChange = (event) => {
    this.props.dbConnectionsManager.setCurrentSchema({ schemaName: event.target.value });
  };

  handleTableChange = (tableName) => {
    this.props.dbConnectionsManager.setCurrentTable({ tableName });
  };

  renderTables() {
    const { classes, dbConnectionsManager } = this.props;
    const { tablesNames } = dbConnectionsManager.getCurrentSchema();
    const { currentTableName } = dbConnectionsManager;
    const rowRenderer = ({ key, index, style }) => {
      const tableName = tablesNames[index];
      return (
        <ListItem
          dense
          button
          onClick={() => this.handleTableChange(tableName)}
          selected={tableName === currentTableName}
          key={key}
          style={style}
          className={classes.listItem}
        >
          <ListItemIcon className={classes.listItemIcon}>
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
          rowHeight={32}
          rowRenderer={rowRenderer}
        />
      )
    }</AutoSizer>;
  }

  render() {
    const { classes, dbConnectionsManager } = this.props;
    const { schemasNames } = dbConnectionsManager.getCurrentConnection();

    return (
      <React.Fragment>
        <Paper square elevation={0} className={`${classes.selectWrapper}`}>
          <Select
            value={dbConnectionsManager.currentSchemaName}
            name="schemas"
            label="Schema"
            dataForOptions={schemasNames}
            onChange={this.handleSchemaChange}
            className={classes.select}
          />
        </Paper>
        <List className={classes.list}>
          {this.renderTables()}
        </List>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(observer(DbTablePicker));
