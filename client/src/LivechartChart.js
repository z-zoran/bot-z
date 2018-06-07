import React, { Component } from 'react';

export class LivechartChart extends Component {
	render() {
		return (
			<div id="Livechart-chart">
				<p>Livechart chart, mothafuckas</p>
				{this.props.content}
			</div>
		);
	}
}
