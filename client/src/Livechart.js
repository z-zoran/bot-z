import React, { Component } from 'react';
import { LivechartChart } from './LivechartChart.js';
import { LivechartPlay } from './LivechartPlay.js';
import { LivechartPortfolio } from './LivechartPortfolio.js';

export class Livechart extends Component {
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
			<div id="Chart-livechart">
				<LivechartChart content={this.state.content} />
				<LivechartPlay handleClick={this.hendlerZaChart} rez={this.state.rez} handleChange={this.handleChange} />
				<LivechartPortfolio />
			</div>
		);
	}
}
