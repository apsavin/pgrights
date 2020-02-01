import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import DatabaseIcon from 'mdi-material-ui/Database';
import EditIcon from 'mdi-material-ui/Pencil';
import type Router from '../../models/Router';
import type DbConnectionsManager from '../../models/DbConnectionsManager';
import withFetch from '../../hocs/withFetch';
import type { FetchProps } from '../../hocs/withFetch';
import ModalLayout from '../../components/ModalLayout';
import Progress from '../../components/Progress';

type Props = {
  dbConnectionsManager: DbConnectionsManager,
  router: Router
} & FetchProps;

class ConnectionChoosePage extends React.Component<Props> {
  async handleChoose(connectionName) {
    const { router, dbConnectionsManager, fetch } = this.props;
    const { error } = await fetch(() => dbConnectionsManager.connect({ connectionName }));
    if (!error) {
      router.toRights();
    }
  }

  handleEdit(name) {
    const { router, dbConnectionsManager } = this.props;
    dbConnectionsManager.setEditingConnectionName(name);
    router.toConnectionEdit();
  }

  renderConnections() {
    const { dbConnectionsManager, showLoader } = this.props;
    const { connectionsNames, currentConnectionName } = dbConnectionsManager;

    return connectionsNames.map((name) => {
      return (
        <ListItem divider button key={name} onClick={() => this.handleChoose(name)}>
          {currentConnectionName === name && showLoader && (
            <Progress autoMargin absolute size="small" />
          )}
          <ListItemAvatar>
            <Avatar>
              <DatabaseIcon/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={name}/>
          <ListItemSecondaryAction>
            <IconButton aria-label="Edit" onClick={() => this.handleEdit(name)}>
              <EditIcon/>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });
  }

  render() {
    return (
      <ModalLayout>
        <Typography variant="h4" gutterBottom>
          Database connections
        </Typography>
        <List>
          {this.renderConnections()}
        </List>
        <Button onClick={() => this.props.router.toConnectionCreate()}>
          Create new connection
        </Button>
      </ModalLayout>
    );
  }
}

export default withFetch()(inject(({ dbConnectionsManager }) => ({
  dbConnectionsManager,
}))(observer(ConnectionChoosePage)));
