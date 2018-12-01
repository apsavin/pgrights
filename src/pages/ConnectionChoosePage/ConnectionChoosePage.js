import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { withSnackbar } from 'notistack';
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
import type DbConnectionsManager from '../../models/DbConnectionsManager';
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
  dbConnectionsManager: DbConnectionsManager,
  enqueueSnackbar: (string, Object) => void,
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
    const { router, dbConnectionsManager, enqueueSnackbar } = this.props;
    this.timer = setTimeout(() => {
      this.setState({ delayPassed: true });
    }, 300);
    await dbConnectionsManager.connect({ connectionName });
    if (!dbConnectionsManager.error) {
      router.toRights();
    } else {
      clearTimeout(this.timer);
      enqueueSnackbar(dbConnectionsManager.error.message, {
        variant: 'error',
      });
    }
  }

  handleEdit(name) {
    const { router, dbConnectionsManager } = this.props;
    dbConnectionsManager.setEditingConnectionName(name);
    router.toConnectionEdit();
  }

  renderConnections() {
    const { dbConnectionsManager, classes } = this.props;
    const { connectionsNames, currentConnectionName, isFetched } = dbConnectionsManager;
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

export default withSnackbar(inject(({ dbConnectionsManager }) => ({
  dbConnectionsManager,
}))(observer(withStyles(styles)(ConnectionChoosePage))));
