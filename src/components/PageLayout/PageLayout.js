import * as React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  layout: {
    height: '100vh'
  },
});

type Props = {
  classes: $Call<typeof styles>,
  children: React.Node,
};

class PageLayout extends React.Component<Props> {
  render() {
    const { children, classes } = this.props;

    return (
      <main className={classes.layout}>
        {children}
      </main>
    );
  }
}

export default withStyles(styles)(PageLayout);
