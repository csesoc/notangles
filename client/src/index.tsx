import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ReactGA from 'react-ga';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Privacy from './components/Privacy';

const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

if (GOOGLE_ANALYTICS_ID !== undefined) {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
    // Debug messages in the browser console
    debug: process.env.NODE_ENV === 'development',
  });

  // Trigger page view on the home page
  ReactGA.pageview(window.location.pathname);
}

const Root: FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact component={App} path="/" />
      <Route component={Privacy} path="/privacy" />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
