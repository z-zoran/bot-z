import React, { Component } from 'react';
import { Livechart } from './Livechart.js';
import { Simchart } from './Simchart.js';
import { Backtest } from './Backtest.js';
import { Portfolio } from './Portfolio.js';
import { Notes } from './Notes.js';
import { Baza } from './Baza.js';


export class MainContainer extends Component {
	render() {
		let difolt = 
			<div id="Chart-difolt">
				<p>Čekaj malo</p>
			</div>;
		let displej = 
			this.props.cont === 'Livechart' ? <Livechart hendleri={this.props.hendleri} /> :
			this.props.cont === 'Simchart' ? <Simchart hendleri={this.props.hendleri} /> :
			this.props.cont === 'Backtest' ? <Backtest hendleri={this.props.hendleri} /> :
			this.props.cont === 'Portfolio' ? <Portfolio hendleri={this.props.hendleri} /> :
			this.props.cont === 'Notes' ? <Notes hendleri={this.props.hendleri} /> :
			this.props.cont === 'Baza' ? <Baza hendleri={this.props.hendleri} /> : difolt;
		return (
			<div id="App-chart">
				{displej}
			</div>
		);
	}
}
