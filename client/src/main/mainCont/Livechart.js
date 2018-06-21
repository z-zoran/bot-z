import React, { Component } from 'react';
import { LivechartChart } from './LivechartChart.js';
import { LivechartPlay } from './LivechartPlay.js';
import { LivechartPortfolio } from './LivechartPortfolio.js';

export class Livechart extends Component {
	constructor(props) {
		super(props);
		this.hendlerZaChart = this.hendlerZaChart.bind(this);
		this.hendlerRezolucije = this.hendlerRezolucije.bind(this);
		this.state = {
			symbol: 'ETHBTC',
			rez: 'min1',
			kolekcija: 'ETHBTC-1m', // ubaciti varijable da se dinamički izračunava ime kolekcije
		}
	}
	hendlerZaChart(start, rez) {
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
				<LivechartChart chartData={this.props.chartData} chartOptions={this.props.chartOptions} />
				<LivechartPlay handlePlay={this.props.hendleri.handlePlay} rez={this.state.rez} handleRez={this.props.hendleri.handleRez} />
				<LivechartPortfolio />
			</div>
		);
	}
}
