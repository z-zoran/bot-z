import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Menu } from './Menu.js';
import { Rolodex } from './Rolodex.js';
import { ChartCont } from './ChartCont.js';
import { Status } from './Status.js';

const kartice = [
	['Timestamp1', 'Symbol1', 'Strat1', 'Profit1'],
	['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
	['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
	['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
	['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
	['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
	['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
]

class App extends Component {
	render() {
		return (
		<div id="App">
			<header id="App-header">
				<img src={logo} id="Header-logo" alt="logo" />
				<h1 id="Header-title">Bot Z</h1>
				<Rolodex cont={kartice} />
				<Status />
			</header>
			<div id="App-container">
				<ChartCont />
				<Menu />
			</div>
		</div>
		);
	}
}

export default App;
