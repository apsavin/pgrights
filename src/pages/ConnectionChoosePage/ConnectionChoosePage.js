import * as React from 'react';
import { inject } from 'mobx-react';
import withStyles from '@material-ui/core/styles/withStyles';
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
import type Router from '../../models/Router';
import ModalLayout from '../../components/ModalLayout';
import Progress from '../../components/Progress';

const styles = () => ({
  progress: {
    position: 'absolute',
    margin: 'auto',
    left: 'calc(50% - 12px)',
  },
});

type Props = {
  connectionsNames: Array<string>,
  connect: ({ connectionName: string }) => Promise<void>,
  setEditingConnectionName: (string) => void,
  isFetched: boolean,
  currentConnectionName: string,
  router: Router
};

class ConnectionChoosePage extends React.Component<Props> {
  state = {
    delayPassed: false,
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  async handleChoose(connectionName) {
    const { router, connect } = this.props;
    this.timer = setTimeout(() => {
      this.setState({ delayPassed: true });
    }, 300);
    await connect({ connectionName });
    router.toRights();
  }

  handleEdit(name) {
    const { router, setEditingConnectionName } = this.props;
    setEditingConnectionName(name);
    router.toConnectionEdit();
  }

  renderConnections() {
    const { connectionsNames, currentConnectionName, isFetched, classes } = this.props;
    const { delayPassed } = this.state;

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
          {currentConnectionName === name && delayPassed &&!isFetched && (
            <Progress size={24} className={classes.progress}/>
          )}
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
  isFetched: dbConnectionsManager.isFetched,
  currentConnectionName: dbConnectionsManager.currentConnectionName,
}))(withStyles(styles)(ConnectionChoosePage));
