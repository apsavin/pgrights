import * as React from 'react';
import { withSnackbar } from 'notistack';

type State = {
  delayPassed: boolean,
};

export type FetchProps<F = 'fetch', I = 'inProgress', S = 'showLoader'> = {
  ...{| [F]: (() => Promise<{ error: Error | null }>) |},
  ...{| [I]: boolean |},
  ...{| [S]: boolean |},
};

type SnackbarProps = {
  enqueueSnackbar: (string, Object) => void,
};

type TMap<F, I, S> = {
  fetch: F,
  inProgress: I,
  showLoader: S,
};
export const defaultMap = { fetch: 'fetch', inProgress: 'inProgress', showLoader: 'showLoader' };

type Options = {
  showSuccessSnackbar: boolean,
  successSnackbarText: string,
};
const defaultOptions = {
  showSuccessSnackbar: false,
  successSnackbarText: ''
};

const withFetch = <F, I, S, Map: TMap<F, I, S>>(map: Map = defaultMap, options?: Options = defaultOptions) =>
  <Props>(Component: React.Component<Props & FetchProps<F, I, S>>): React.Component<Props> => {
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

        const { enqueueSnackbar } = this.props;
        if (error) {
          enqueueSnackbar(error.message, { variant: 'error' });
        } else if (options.showSuccessSnackbar) {
          enqueueSnackbar(options.successSnackbarText, { variant: 'success' });
        }
        return { error };
      };

      render() {
        const { inProgress, delayPassed } = this.state;
        const fetchProps = {
          [map.fetch]: this.fetch,
          [map.inProgress]: inProgress,
          [map.showLoader]: inProgress && delayPassed,
        };

        return (
          <Component
            {...this.props}
            {...fetchProps}
          />
        );
      }
    }

    return withSnackbar(ProgressEventsHandler);
  };

export default withFetch;
