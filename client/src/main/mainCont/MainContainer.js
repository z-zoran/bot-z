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
			<div id="Main-difolt">
				<p>Čekaj malo</p>
			</div>;
		let displej = 
			this.props.view === 'Livechart' ? <Livechart hendleri={this.props.hendleri} /> :
			this.props.view === 'Simchart' ? <Simchart hendleri={this.props.hendleri} /> :
			this.props.view === 'Backtest' ? <Backtest hendleri={this.props.hendleri} /> :
			this.props.view === 'Portfolio' ? <Portfolio hendleri={this.props.hendleri} /> :
			this.props.view === 'Notes' ? <Notes hendleri={this.props.hendleri} /> :
			this.props.view === 'Baza' ? <Baza hendleri={this.props.hendleri} /> : difolt;
		return (
			<div id="Main">
				{displej}
			</div>
		);
	}
}
