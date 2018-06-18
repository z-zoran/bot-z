import React, { Component } from 'react';
import { LivechartChart } from './LivechartChart.js';
import { LivechartPlay } from './LivechartPlay.js';
import { LivechartPortfolio } from './LivechartPortfolio.js';
import { kendlFetcher } from './kendlFetcher.js';

export class Livechart extends Component {
	constructor(props) {
		super(props);
		this.hendlerZaChart = this.hendlerZaChart.bind(this);
		this.hendlerRezolucije = this.hendlerRezolucije.bind(this);
		this.state = {
			chartData: {}, 
			chartOptions: {},
			symbol: 'ETHBTC',
			rez: rez,
			kolekcija: 'ETHBTC-1m', // ubaciti varijable da se dinamički izračunava ime kolekcije
		}
	}
	hendlerZaChart(start, rez) {
		kendlFetcher(); // tu ubaciti kod za kendl fetchanje
		this.setState({ content: 'Nešto nešto blaaaa'});
		// napisati hendler koji dohvaća chartData od servera
		// integrirati sa react-chartjs libraryjem ili tako nešto
	}
	hendlerRezolucije(rez) {
		console.log('Promjena rezolucije: ' + rez);
		this.setState({ rez: rez });
		// hendler koji updejta rezoluciju kad se stisne na opcije
	}
	render() {
		return (
			<div id="Chart-livechart">
				<LivechartChart chartData={this.state.chartData} chartOptions={this.state.chartOptions} />
				<LivechartPlay handleClick={this.hendlerZaChart} rez={this.state.rez} handleChange={this.hendlerRezolucije} />
				<LivechartPortfolio />
			</div>
		);
	}
}
