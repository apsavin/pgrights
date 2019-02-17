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
  absolute: {
    position: 'absolute',
  },
  small: {},
  autoMargin: {
    margin: 'auto',
    '&$absolute': {
      left: 'calc(50% - 25px)',
      top: 'calc(50% - 25px)',
      '&$small': {
        left: 'calc(50% - 12px)',
        top: 'calc(50% - 12px)',
      },
    },
  },
  background: {
    color: theme.palette.primary.main,
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
  absolute?: boolean,
  size: 'big' | 'small',
  className?: string,
};

class Progress extends React.Component<Props> {

  static defaultProps = {
    size: 'big',
  };

  render() {
    const { classes, autoMargin, size, className, absolute } = this.props;
    const realSize = size === 'big' ? 50 : 24;
    const rootClassNames = classnames(classes.root, className, {
      [classes.autoMargin]: autoMargin,
      [classes.absolute]: absolute,
      [classes.small]: size !== 'big',
    });

    return (
      <div className={rootClassNames}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classes.background}
          size={realSize}
          thickness={4}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classes.foreground}
          size={realSize}
          thickness={4}
        />
      </div>
    );
  }
}

export default withStyles(styles)(observer(Progress));
