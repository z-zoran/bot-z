import React, { Component } from 'react';
import { BacktestChart } from './BacktestChart.js';
import { BacktestPlay } from './BacktestPlay.js';
import { BacktestPortfolio } from './BacktestPortfolio.js';

export class Backtest extends Component {
	constructor(props) {
		super(props);
		this.hendlerZaChart = this.hendlerZaChart.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.state = {
			content: 'Bla bla 123',
			rez: 'min1',
		}
	}
	hendlerZaChart(start, rez) {
		this.setState({ content: 'Nešto nešto blaaaa'});
		// napisati hendler koji dohvaća chartData od servera
		// integrirati sa react-chartjs libraryjem ili tako nešto
	}
	handleChange(rez) {
		this.setState({ rez: rez })
		// hendler koji updejta rezoluciju kad se stisne na opcije
	}
	render() {
		return (
			<div id="Chart-backtest">
				<BacktestChart content={this.state.content} />
				<BacktestPlay handleClick={this.hendlerZaChart} rez={this.state.rez} handleChange={rez => this.handleChange(rez)} />
				<BacktestPortfolio />
			</div>
		);
	}
}
