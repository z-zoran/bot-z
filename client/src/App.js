import React, { Component } from 'react';
import './App.css';
// react komponente
import { Title } from './header/title/Title.js';
import { SideContainer } from './main/sideCont/SideContainer';
import { Rolodex } from './header/rolodex/Rolodex';
import { MainContainer } from './main/mainCont/MainContainer';
import { Status } from './header/status/Status.js';
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
// hendleri akcija
import { handlePlay } from './hendleri/handlePlay.js';
import { handleRez } from './hendleri/handleRez.js';
import { handleRolodex } from './hendleri/handleRolodex.js';
import { handleView } from './hendleri/handleView.js';
import { handleRunLive } from './hendleri/handleRunLive.js';
import { handleRunSim } from './hendleri/handleRunSim.js';

const menu = [
	{ ime: 'Livechart', handleClick: () => this.hendleri.handleView('Livechart'), ikona: ikonaChart }, 
	{ ime: 'Simchart', handleClick: () => this.hendleri.handleView('Simchart'), ikona: ikonaBanknote }, 
	{ ime: 'Backtest', handleClick: () => this.hendleri.handleView('Backtest'), ikona: ikonaCreative }, 
	{ ime: 'Portfolio', handleClick: () => this.hendleri.handleView('Portfolio'), ikona: ikonaChess }, 
	{ ime: 'Notes', handleClick: () => this.hendleri.handleView('Notes'), ikona: ikonaGears }, 
	{ ime: 'Baza', handleClick: () => this.hendleri.handleView('Baza'), ikona: ikonaSearch },
]		


class App extends Component {
	constructor(props) {
		super(props);
		// bajndamo hendlere
		this.hendleri = {
			handlePlay: handlePlay.bind(this),
			handleRez: handleRez.bind(this),
			handleRolodex: handleRolodex.bind(this),
			handleView: handleView.bind(this),
			handleRunSim: handleRunSim.bind(this),
			handleRunLive: handleRunLive.bind(this),
		};
		this.menu = menu;
		this.state = {
			stat: 'Offline',
			view: 'Livechart',
			mainCont: {},
			sideCont: {},
			rolodex: [
				{
					timestamp: 1234,
					symbol: 'BLABLA',
					strat: 'Ultra strategija',
					profit: 112000,
				},
				{
					timestamp: 3214,
					symbol: 'MAMBO',
					strat: 'Mega strategija',
					profit: 432000,
				},
				{
					timestamp: 66663,
					symbol: 'DŽAMBO',
					strat: 'Super strategija',
					profit: 14,
				},
			],
		};
	};

	render() {
		return (
		<div id="App">
			<header id="App-header">
				<Title logo={logo} />
				<Rolodex karte={this.state.rolodex} hendleri={this.hendleri} />
				<Status ikona={this.state.stat === 'Online' ? ikonaNetworkOn : ikonaNetworkOff} stat={this.state.stat} hendleri={this.hendleri} />
			</header>
			<div id="App-main">
				<MainContainer view={this.state.view} content={this.state.mainCont} hendleri={this.hendleri} />
				<SideContainer view={this.state.view} content={this.state.sideCont} menu={this.menu} hendleri={this.hendleri} />
			</div>
		</div>
		);
	}
}

export default App;
