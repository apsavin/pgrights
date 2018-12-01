import * as React from 'react';
import { observer } from 'mobx-react';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { lighten } from '@material-ui/core/styles/colorManipulator'
import classnames from 'classnames';

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    position: 'relative',
  },
  autoMargin: {
    margin: 'auto'
  },
  background: {
    color: theme.palette.primary.dark,
  },
  foreground: {
    color: lighten(theme.palette.primary.light, 0.4),
    animationDuration: '550ms',
    position: 'absolute',
    left: 0,
  },
});

type Props = {
  classes: $Call<typeof styles>,
  autoMargin?: boolean,
  size: number,
};

class Progress extends React.Component<Props> {

  static defaultProps = {
    size: 50,
  };

  render() {
    const { classes, autoMargin, size } = this.props;

    return (
      <div className={classnames(classes.root, { [classes.autoMargin]: autoMargin })}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classes.background}
          size={size}
          thickness={4}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classes.foreground}
          size={size}
          thickness={4}
        />
      </div>
    );
  }
}

export default withStyles(styles)(observer(Progress));
