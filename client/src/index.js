import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

/**
 * App
 * |__App-header
 * |    |__Header-logo
 * |    |__Header-title
 * |    |__Rolodex
 * |    |    |__Karta
 * |    |    |__Karta
 * |    |    |__...
 * |    |__Status
 * |__App-container
 *      |__MainContainer
 *      |    |__Livechart/Portfolio/Notes/Stratovi/Postavke/Baza
 *      |__Menu
 *           |__Konzola
 *           |__Gumb
 *           |__Gumb
 *           |__...
 */