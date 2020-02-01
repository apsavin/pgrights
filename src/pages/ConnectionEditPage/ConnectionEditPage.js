import * as React from 'react';
import { inject } from 'mobx-react';
import type Router from '../../models/Router';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';
import ModalLayout from '../../components/ModalLayout';
import type DbConnection, { TDbConnectionData } from '../../models/DbConnection';

const styles = () => ({
  secondaryButton: {
    float: 'right',
  }
});

type Props = {
  router: Router,
  classes: $Call<typeof styles>,
  connection: DbConnection,
  addConnection: (TDbConnectionData) => void;
};

class ConnectionEditPage extends React.Component<Props> {

  handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {};
    for (let [key, value] of formData) {
      data[key] = value;
    }

    const { addConnection } = this.props;

    await addConnection(data);
    this.props.router.toConnectionChoose();
  };

  render() {
    const { classes, connection } = this.props;

    return (
      <ModalLayout>
        <Typography variant="h4" gutterBottom>
          Edit database connection
        </Typography>
        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField name="name" fullWidth label="Name" defaultValue={connection.name} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="database" fullWidth label="Database" defaultValue={connection.database}/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="host" fullWidth label="Host" defaultValue={connection.host}/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="port" fullWidth label="Port" defaultValue={connection.port}/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="user" fullWidth label="User" defaultValue={connection.user}/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="password" fullWidth label="Password" type="password" defaultValue={connection.password}/>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => this.props.router.toConnectionChoose()}
                className={classes.secondaryButton}
              >
                Open list of connections
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalLayout>
    );
  }
}

export default inject(({ dbConnectionsManager }) => ({
  connection: dbConnectionsManager.getEditingConnection(),
  addConnection: dbConnectionsManager.addConnection,
}))(withStyles(styles)(ConnectionEditPage));
