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
	constructor(props) {
		super(props)
		this.menu = [
			{ ime: 'Backtest', handleClick: this.hendlerBacktest.bind(this) }, 
			{ ime: 'Portfolio', handleClick: this.hendlerPortfolio.bind(this) }, 
			{ ime: 'Stratovi', handleClick: this.hendlerStratovi.bind(this) }, 
			{ ime: 'Live', handleClick: this.hendlerLive.bind(this) }, 
			{ ime: 'Killswitch', handleClick: this.hendlerKillswitch.bind(this) },
		]
		this.state = {
			view: 'Backtest',
			stat: 'Status: Offline',
		}
		this.hendlerStatus = this.hendlerStatus.bind(this);
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
	hendlerLive() {
		this.setState({view: 'Live'});
	}
	hendlerKillswitch() {
		this.setState({view: <h2>Kill sve što se kreće!!!</h2>});
	}
	/* status - play/pauza hendler */
	hendlerStatus() {
		if (this.state.stat === 'Status: Offline') {
			this.setState({stat: 'Status: Online'})
		} else if (this.state.stat === 'Status: Online') {
			this.setState({stat: 'Status: Offline'})
		}
	}
	render() {
		return (
		<div id="App">
			<header id="App-header">
				<img src={logo} id="Header-logo" alt="logo" />
				<h1 id="Header-title">Bot Z</h1>
				<Rolodex cont={kartice} />
				<Status stat={this.state.stat} handleClick={this.hendlerStatus} />
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
