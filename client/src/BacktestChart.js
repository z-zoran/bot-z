import React, { Component } from 'react';

export class BacktestChart extends Component {
	render() {
		return (
			<div id="Backtest-chart">
				<p>Backtest chart, mothafuckas</p>
				{this.props.content}
			</div>
		);
	}
}
