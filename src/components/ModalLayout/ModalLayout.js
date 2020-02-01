import * as React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2 * 2))]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3 * 2))]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
});

type Props = {
  classes: $Call<typeof styles>,
  children: React.Node,
};

class ModalLayout extends React.Component<Props> {
  render() {
    const { children, classes } = this.props;

    return (
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          {children}
        </Paper>
      </main>
    );
  }
}

export default withStyles(styles)(ModalLayout);
