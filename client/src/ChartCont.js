import React, { Component } from 'react';
import { Backtest } from './Backtest.js';
import { Portfolio } from './Portfolio.js';
import { Stratovi } from './Stratovi.js';
import { Postavke } from './Postavke.js';
import { Notes } from './Notes.js';
import { Baza } from './Baza.js';


export class ChartCont extends Component {
	render() {
		let difolt = 
			<div id="Chart-difolt">
				<p>difolt, mothafuckas</p>
			</div>;
		let displej = 
			this.props.cont === 'Backtest' ? <Backtest /> :
			this.props.cont === 'Portfolio' ? <Portfolio /> :
			this.props.cont === 'Stratovi' ? <Stratovi /> :
			this.props.cont === 'Postavke' ? <Postavke /> :
			this.props.cont === 'Notes' ? <Notes /> :
			this.props.cont === 'Baza' ? <Baza /> : difolt;
		return (
			<div id="App-chart">
				{displej}
			</div>
		);
	}
}
