import React, { Component } from 'react';
import './App.css';
import { Menu } from './Menu.js';
import { Rolodex } from './Rolodex.js';
import { MainContainer } from './MainContainer.js';
import { Status } from './Status.js';
// ikone za UI
import logo from './logo.svg';
import ikonaGears from './svg/008-gears.svg';
import ikonaSearch from './svg/003-search.svg';
import ikonaCreative from './svg/010-creative.svg';
import ikonaBanknote from './svg/015-banknote.svg';
import ikonaChess from './svg/012-chess-piece.svg';
import ikonaNetworkOff from './svg/014-network.svg';
import ikonaNetworkOn from './svg/014-network-on.svg';
import ikonaChart from './svg/011-computer.svg';

class App extends Component {
	constructor(props) {
		super(props)
		this.kartice = [
			['S desna dolaze obavljeni roundtripovi', '', '', ''],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
			['Timestamp4', 'Symbol4', 'Strat4', 'Profit4'],
			['Timestamp5', 'Symbol5', 'Strat5', 'Profit5'],
			['Timestamp6', 'Symbol6', 'Strat6', 'Profit6'],
			['Timestamp7', 'Symbol7', 'Strat7', 'Profit7'],
		]
		this.menu = [
			{ ime: 'Livechart', handleClick: () => this.hendlerClient('Livechart'), ikona: ikonaChart }, 
			{ ime: 'Portfolio', handleClick: () => this.hendlerClient('Portfolio'), ikona: ikonaBanknote }, 
			{ ime: 'Notes', handleClick: () => this.hendlerClient('Notes'), ikona: ikonaCreative }, 
			{ ime: 'Stratovi', handleClick: () => this.hendlerClient('Stratovi'), ikona: ikonaChess }, 
			{ ime: 'Postavke', handleClick: () => this.hendlerClient('Postavke'), ikona: ikonaGears }, 
			{ ime: 'Baza', handleClick: () => this.hendlerClient('Baza'), ikona: ikonaSearch },
		]
		this.state = {
			view: 'Livechart',
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
		let data = this.kartice[0];
		let zahtjev = 'Ubaci tip zahtjeva'
		fetch('/', {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: JSON.stringify(data), // must match 'Content-Type' header
			headers: {
				'User-agent': 'Mozilla/4.0',
				'Content-type': 'application/json',
				'Timestamp': Date.now(),
				'Zahtjev': zahtjev,
			},
		}).then(response => response.json()).then(json => { this.setState({view: 'Livechart'}) })
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
				<MainContainer cont={this.state.view} />
				<Menu menu={this.menu} />
			</div>
		</div>
		);
	}
}

export default App;
