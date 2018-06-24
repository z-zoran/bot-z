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
			this.props.view === 'Livechart' ? 
				<Livechart 
					content={this.props.content} 
					hendleri={this.props.hendleri} 
				/> :
			this.props.view === 'Simchart' ? 
				<Simchart 
					content={this.props.content} 
					hendleri={this.props.hendleri} 
				/> :
			this.props.view === 'Backtest' ? 
				<Backtest 
					content={this.props.content} 
					hendleri={this.props.hendleri} 
				/> :
			this.props.view === 'Portfolio' ? 
				<Portfolio 
					content={this.props.content} 
					hendleri={this.props.hendleri} 
				/> :
			this.props.view === 'Notes' ? 
				<Notes 
					content={this.props.content} 
					hendleri={this.props.hendleri} 
				/> :
			this.props.view === 'Baza' ? 
				<Baza 
					content={this.props.content} 
					hendleri={this.props.hendleri} 
				/> : difolt;
		return (
			<div id="Main">
				{displej}
			</div>
		);
	}
}
