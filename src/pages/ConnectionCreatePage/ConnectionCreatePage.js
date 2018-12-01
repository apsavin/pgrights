import * as React from 'react';
import { inject } from 'mobx-react';
import type Router from '../../models/Router';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';
import ModalLayout from '../../components/ModalLayout';
import type { TDbConnectionData } from '../../models/DbConnection';

const styles = () => ({
  secondaryButton: {
    float: 'right',
  }
});

type Props = {
  router: Router,
  classes: $Call<typeof styles>,
  addConnection: (TDbConnectionData) => void;
};

class ConnectionCreatePage extends React.Component<Props> {

  handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {};
    for (let [key, value] of formData) {
      data[key] = value;
    }

    this.props.addConnection(data);
    this.props.router.toConnectionChoose();
  };

  render() {
    const { classes } = this.props;

    return (
      <ModalLayout>
        <Typography variant="h4" gutterBottom>
          New database connection
        </Typography>
        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <TextField name="name" fullWidth label="Name" defaultValue="postgres@localhost" />
            </Grid>
            <Grid item xs={12}>
              <TextField name="database" fullWidth label="Database" defaultValue="postgres"/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="host" fullWidth label="Host" defaultValue="localhost"/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="port" fullWidth label="Port" defaultValue="5432"/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="user" fullWidth label="User"/>
            </Grid>
            <Grid item xs={12}>
              <TextField name="password" fullWidth label="Password" type="password"/>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                Create
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
  addConnection: dbConnectionsManager.addConnection,
}))(withStyles(styles)(ConnectionCreatePage));
