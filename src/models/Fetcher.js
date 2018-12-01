import { decorate, observable, computed, flow } from "mobx";

export const FETCHER_STATES = {
  initial: 'initial',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

class Fetcher {
  constructor({ fetch }) {
    this._fetch = fetch;
    this.state = FETCHER_STATES.initial;
    this.error = null;
    this.result = null;
  }

  fetch = flow(function* fetch(...args) {
    this.error = null;
    this.state = FETCHER_STATES.loading;
    try {
      this.result = yield this._fetch(...args);
      this.state = FETCHER_STATES.success;
    } catch (error) {
      this.error = error;
      this.state = FETCHER_STATES.error;
    }
    return this;
  }).bind(this);

  get inLoadingState() {
    return this.state === FETCHER_STATES.loading;
  }

  get inErrorState() {
    return this.state === FETCHER_STATES.error;
  }

  get inSuccessState() {
    return this.state === FETCHER_STATES.success;
  }
}

decorate(Fetcher, {
  state: observable,
  error: observable,
  result: observable,
  inLoadingState: computed,
  inErrorState: computed,
  inSuccessState: computed,
});

export default Fetcher;
