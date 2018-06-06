import React, { Component } from 'react';
import './App.css';
import { Menu } from './Menu.js';
import { Rolodex } from './Rolodex.js';
import { ChartCont } from './ChartCont.js';
import { Status } from './Status.js';
// ikone za UI
import logo from './logo.svg';
import ikonaGears from './svg/008-gears.svg';
import ikonaSearch from './svg/003-search.svg';
import ikonaCreative from './svg/010-creative.svg';
import ikonaBanknote from './svg/015-banknote.svg';
import ikonaChess from './svg/012-chess-piece.svg';
import ikonaClock from './svg/001-clock.svg';
import ikonaNetworkOff from './svg/014-network.svg';
import ikonaNetworkOn from './svg/014-network-on.svg';

class App extends Component {
	constructor(props) {
		super(props)
		this.kartice = [
			['S desna dolaze obavljeni roundtripovi', '', '', ''],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
		]
		this.menu = [
			{ ime: 'Backtest', handleClick: () => this.hendlerClient('Backtest'), ikona: ikonaClock }, 
			{ ime: 'Portfolio', handleClick: () => this.hendlerClient('Portfolio'), ikona: ikonaBanknote }, 
			{ ime: 'Stratovi', handleClick: () => this.hendlerClient('Stratovi'), ikona: ikonaChess }, 
			{ ime: 'Postavke', handleClick: () => this.hendlerClient('Postavke'), ikona: ikonaGears }, 
			{ ime: 'Notes', handleClick: () => this.hendlerClient('Notes'), ikona: ikonaCreative }, 
			{ ime: 'Baza', handleClick: () => this.hendlerClient('Baza'), ikona: ikonaSearch },
		]
		this.state = {
			view: 'Backtest',
			stat: 'Offline',
		}
		this.hendlerClient = this.hendlerClient.bind(this);
		this.hendlerServer = this.hendlerServer.bind(this);
	}
	/* hendler za viewove */
	hendlerClient(koji) {
		this.setState({ view: koji })
	}
	/* server hendler */
	hendlerServer() {
		if (this.state.stat === 'Offline') {
			this.setState({stat: 'Online'})
		} else if (this.state.stat === 'Online') {
			this.setState({stat: 'Offline'})
		}
		this.setState({view: 'Pričekaj'})
		let data = this.kartice;
		fetch('/', {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: JSON.stringify(data), // must match 'Content-Type' header
			headers: {
				'User-agent': 'Mozilla/4.0',
				'Content-type': 'application/json',
			},
		}).then(response => response.json()).then(json => { this.setState({view: json[0]}) })
	}
	render() {
		return (
		<div id="App">
			<header id="App-header">
				<img src={logo} id="Header-logo" alt="logo" />
				<h1 id="Header-title">Bot Z</h1>
				<Rolodex karte={this.kartice} />
				<Status ikona={this.state.stat === 'Online' ? ikonaNetworkOn : ikonaNetworkOff} stat={this.state.stat} handleClick={this.hendlerServer} />
			</header>
			<div id="App-container">
				<ChartCont cont={this.state.view} />
				<Menu cont={this.menu} />
			</div>
		</div>
		);
	}
}

export default App;
