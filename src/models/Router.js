import { decorate, observable, action } from "mobx";
import routes from '../constants/routes';

class Router {
  currentRoute = null;

  toConnectionChoose() {
    this.currentRoute = routes.connectionChoose;
  }

  toConnectionCreate() {
    this.currentRoute = routes.connectionCreate;
  }

  toConnectionEdit() {
    this.currentRoute = routes.connectionEdit;
  }

  toRights() {
    this.currentRoute = routes.rights;
  }
}

decorate(Router, {
  currentRoute: observable,
  toConnectionCreate: action,
  toConnectionChoose: action,
  toConnectionEdit: action,
  toRights: action,
});

export default Router;
