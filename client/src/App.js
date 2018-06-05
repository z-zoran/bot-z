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
			['Timestamp1', 'Symbol1', 'Strat1', 'Profit1'],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
			['Timestamp2', 'Symbol2', 'Strat2', 'Profit2'],
			['Timestamp3', 'Symbol3', 'Strat3', 'Profit3'],
		]
		this.menu = [
			{ ime: 'Backtest', handleClick: this.hendlerBacktest.bind(this), ikona: ikonaClock }, 
			{ ime: 'Portfolio', handleClick: this.hendlerPortfolio.bind(this), ikona: ikonaBanknote }, 
			{ ime: 'Stratovi', handleClick: this.hendlerStratovi.bind(this), ikona: ikonaChess }, 
			{ ime: 'Postavke', handleClick: this.hendlerPostavke.bind(this), ikona: ikonaGears }, 
			{ ime: 'Notes', handleClick: this.hendlerNotes.bind(this), ikona: ikonaCreative }, 
			{ ime: 'Baza', handleClick: this.hendlerBaza.bind(this), ikona: ikonaSearch },
		]
		this.state = {
			view: 'Backtest',
			stat: 'Offline',
		}
		this.hendlerKillswitch = this.hendlerKillswitch.bind(this);
	}
	/* hendleri klikova na meni */
	hendlerBacktest() {
		this.setState({view: 'Backtest'});
	}
	hendlerPortfolio() {
		this.setState({view: 'Portfolio'});
	}
	hendlerStratovi() {
		this.setState({view: 'Stratovi'});
	}
	hendlerPostavke() {
		this.setState({view: 'Postavke'});
	}
	hendlerNotes() {
		this.setState({view: 'Notes'});
	}
	hendlerBaza() {
		this.setState({view: 'Baza podataka'});
	}
	/* play/pauza hendler */
	hendlerKillswitch() {
		if (this.state.stat === 'Offline') {
			this.setState({stat: 'Online'})
		} else if (this.state.stat === 'Online') {
			this.setState({stat: 'Offline'})
		}
		fetch('/')
			.then(res => this.setState({view: res.text()}))
	}
	render() {
		return (
		<div id="App">
			<header id="App-header">
				<img src={logo} id="Header-logo" alt="logo" />
				<h1 id="Header-title">Bot Z</h1>
				<Rolodex karte={this.kartice} />
				<Status ikona={this.state.stat === 'Online' ? ikonaNetworkOn : ikonaNetworkOff} stat={this.state.stat} handleClick={this.hendlerKillswitch} />
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
