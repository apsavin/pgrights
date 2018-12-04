import * as React from 'react';
import { observer, Provider } from 'mobx-react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider } from 'notistack';

import routes from './constants/routes';

import type Router from './models/Router';

import ConnectionChoosePage from './pages/ConnectionChoosePage';
import ConnectionCreatePage from './pages/ConnectionCreatePage';
import RightsPage from './pages/RightsPage';
import persistentStorage from './persistentStorage';
import { dbConnectionsManager } from './data';
import ConnectionEditPage from './pages/ConnectionEditPage';

type Props = {
  router: Router,
};

class App extends React.Component<Props> {
  componentWillMount() {
    const { router } = this.props;

    if (persistentStorage.store.connections) {
      dbConnectionsManager.addConnections(persistentStorage.store.connections, true);
      router.toConnectionChoose();
    }
  }

  renderPage() {
    const { router } = this.props;

    switch (router.currentRoute) {
      case routes.connectionCreate:
        return <ConnectionCreatePage router={router}/>;
      case routes.connectionEdit:
        return <ConnectionEditPage router={router}/>;
      case routes.connectionChoose:
        return <ConnectionChoosePage router={router}/>;
      case routes.rights:
        return (
          <RightsPage router={router}/>
        );
      default:
        return <ConnectionCreatePage router={router}/>;
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline/>
        <Provider dbConnectionsManager={dbConnectionsManager}>
          <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            {this.renderPage()}
          </SnackbarProvider>
        </Provider>
      </React.Fragment>
    );
  }
}

export default observer(App);
