import React, { Component } from 'react';

export class ChartCont extends Component {
	render() {
		return (
			<div id="App-chart">
				<p>{this.props.cont}</p>
			</div>
		);
	}
}
