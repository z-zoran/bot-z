import React, { Component } from 'react';
import { PlayRez } from './PlayRez.js'

export class LivechartPlay extends Component {
	render() {
		return (
			<div id="Livechart-play">
				<PlayRez rez={this.props.rez} handleChange={this.props.handleChange} />
			</div>
		);
	}
}
