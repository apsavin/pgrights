import * as React from 'react';
import { withSnackbar } from 'notistack';

type State = {
  delayPassed: boolean,
};

export type FetchProps = {
  fetch: (() => Promise<{ error: Error | null }>),
  inProgress: boolean,
  showLoader: boolean,
};

type SnackbarProps = {
  enqueueSnackbar: (string, Object) => void,
};

const withFetch = () => <Props>(Component: React.Component<Props & FetchProps>): React.Component<Props> => {
  class ProgressEventsHandler extends React.Component<Props & SnackbarProps, State> {
    state = {
      delayPassed: false,
      inProgress: false,
    };

    componentWillUnmount() {
      clearTimeout(this.timer);
    }

    fetch = async (fetch) => {
      this.setState({ delayPassed: false, inProgress: true });
      this.timer = setTimeout(() => this.setState({ delayPassed: true }), 300);

      const { error } = await fetch();

      clearTimeout(this.timer);
      this.setState({ inProgress: false });

      if (error) {
        this.props.enqueueSnackbar(error.message, { variant: 'error' });
      }
      return { error };
    };

    render() {
      const { inProgress, delayPassed } = this.state;

      return (
        <Component
          {...this.props}
          fetch={this.fetch}
          inProgress={inProgress}
          showLoader={inProgress && delayPassed}
        />
      );
    }
  }

  return withSnackbar(ProgressEventsHandler);
};

export default withFetch;
