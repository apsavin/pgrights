import * as React from 'react';
import { inject } from 'mobx-react';
import type Router from '../../models/Router';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DatabaseIcon from 'mdi-material-ui/Database';
import EditIcon from 'mdi-material-ui/Pencil';
import ModalLayout from '../../components/ModalLayout';

type Props = {
  connectionsNames: Array<string>,
  connect: ({ connectionName: string }) => Promise<void>,
  setEditingConnectionName: (string) => void,
  router: Router
};

class ConnectionChoosePage extends React.Component<Props> {
  async handleChoose(connectionName) {
    const { router, connect } = this.props;
    await connect({ connectionName });
    router.toRights();
  }

  handleEdit(name) {
    const { router, setEditingConnectionName } = this.props;
    setEditingConnectionName(name);
    router.toConnectionEdit();
  }

  renderConnections() {
    const { connectionsNames } = this.props;

    return connectionsNames.map((name) => {
      return (
        <ListItem divider button key={name} onClick={() => this.handleChoose(name)}>
          <Avatar>
            <DatabaseIcon/>
          </Avatar>
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

export default inject(({ dbConnectionsManager }) => ({
  connect: dbConnectionsManager.connect,
  setEditingConnectionName: dbConnectionsManager.setEditingConnectionName,
  connectionsNames: dbConnectionsManager.connectionsNames,
}))(ConnectionChoosePage);
