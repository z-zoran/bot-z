import React, { Component } from 'react';
import './App.css';
import { SideContainer } from './sideCont/SideContainer';
import { Rolodex } from './rolodex/Rolodex';
import { MainContainer } from './mainCont/MainContainer';
import { Status } from './status/Status.js';
// ikone za UI
import logo from './svg/logo.svg';
import ikonaGears from './svg/008-gears.svg';
import ikonaSearch from './svg/003-search.svg';
import ikonaCreative from './svg/010-creative.svg';
import ikonaBanknote from './svg/015-banknote.svg';
import ikonaChess from './svg/012-chess-piece.svg';
import ikonaNetworkOff from './svg/014-network.svg';
import ikonaNetworkOn from './svg/014-network-on.svg';
import ikonaChart from './svg/011-computer.svg';

// import { kendlFetcher } from './hendleri/kendlFetcher.js';


class App extends Component {
	constructor(props) {
		super(props)
		this.menu = [
			{ ime: 'Livechart', handleClick: () => this.hendlerClient('Livechart'), ikona: ikonaChart }, 
			{ ime: 'Portfolio', handleClick: () => this.hendlerClient('Portfolio'), ikona: ikonaBanknote }, 
			{ ime: 'Notes', handleClick: () => this.hendlerClient('Notes'), ikona: ikonaCreative }, 
			{ ime: 'Stratovi', handleClick: () => this.hendlerClient('Stratovi'), ikona: ikonaChess }, 
			{ ime: 'Postavke', handleClick: () => this.hendlerClient('Postavke'), ikona: ikonaGears }, 
			{ ime: 'Baza', handleClick: () => this.hendlerClient('Baza'), ikona: ikonaSearch },
		]
		this.state = {
			stat: 'Offline',
			view: 'Livechart',
			mainCont: {},
			sideCont: {},
			rolodex: [
				{
					id: 'testid0',
					timestamp: 1234,
					symbol: 'BLABLA',
					strat: 'Ultra strategija',
					profit: 100000,
				},
				{
					id: 'testid1',
					timestamp: 3214,
					symbol: 'MAMBO',
					strat: 'Mega strategija',
					profit: 100000,
				},
				{
					id: 'testid2',
					timestamp: 66663,
					symbol: 'DŽAMBO',
					strat: 'Super strategija',
					profit: 100000,
				},
			],
		}
		this.hendlerClient = this.hendlerClient.bind(this);
		this.hendlerServer = this.hendlerServer.bind(this);
		this.hendleri = {
			handlePlay: {},
			handleRez: {},
			handleRolodex: {},
		}
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
		let data = {
			zahtjev: 'Tip zahtjeva',
			timestamp: Date.now(),
			view: this.state.view,
			stat: this.state.stat,
		};
		fetch('/', {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: JSON.stringify(data), // must match 'Content-Type' header
			headers: {
				'User-agent': 'Mozilla/4.0',
				'Content-type': 'application/json',
			},
		}).then(response => response.json())
			.then(JSON.parse)
			.then(obj => this.setState({view: 'Livechart'}))
	}

	render() {
		return (
		<div id="App">
			<header id="App-header">
				<img src={logo} id="Header-logo" alt="logo" />
				<h1 id="Header-title">Bot Z</h1>
				<Rolodex karte={this.state.rolodex} hendleri={this.hendleri} />
				<Status ikona={this.state.stat === 'Online' ? ikonaNetworkOn : ikonaNetworkOff} stat={this.state.stat} handleClick={this.hendlerServer} />
			</header>
			<div id="App-container">
				<MainContainer cont={this.state.view} hendleri={this.hendleri} />
				<SideContainer cont={this.state.sideCont} menu={this.menu} />
			</div>
		</div>
		);
	}
}

export default App;
