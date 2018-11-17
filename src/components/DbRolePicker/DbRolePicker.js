import * as React from 'react';
import { observer } from 'mobx-react';
import { AutoSizer, List as VirtualizedList } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import AccountOutlineIcon from 'mdi-material-ui/AccountOutline';
import DbConnectionsManager from '../../models/DbConnectionsManager';

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

class DbRolePicker extends React.Component<Props> {

  handleRoleChange = (roleName) => {
    this.props.dbConnectionsManager.setCurrentRole({ roleName });
  };

  renderRoles() {
    const { classes, dbConnectionsManager } = this.props;
    const { rolesNames } = dbConnectionsManager.getCurrentConnection();
    const { currentRoleName } = dbConnectionsManager;

    const rowRenderer = ({ key, index, style }) => {
      const roleName = rolesNames[index];

        return (
          <ListItem
            dense
            button
            onClick={() => this.handleRoleChange(roleName)}
            selected={roleName === currentRoleName}
            key={key}
            style={style}
            className={classes.listItem}
          >
            <ListItemIcon className={classes.listItemIcon}>
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
    };

    return <AutoSizer>{
      ({ width, height }) => (
        <VirtualizedList
          width={width}
          height={height}
          rowCount={rolesNames.length}
          rowHeight={32}
          rowRenderer={rowRenderer}
        />
      )
    }</AutoSizer>;
  }

  render() {
    const { classes } = this.props;

    return (
      <List className={classes.list}>
        {this.renderRoles()}
      </List>
    );
  }
}

export default withStyles(styles)(observer(DbRolePicker));
