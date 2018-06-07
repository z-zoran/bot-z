import React, { Component } from 'react';
import { PlayPlay } from './PlayPlay.js'
import { PlayFF } from './PlayFF.js'
import { PlayRez } from './PlayRez.js'

export class BacktestPlay extends Component {
	render() {
		return (
			<div id="Backtest-play">
				<PlayRez rez={this.props.rez} handleChange={this.props.handleChange} />
				<PlayPlay />
				<PlayFF />
			</div>
		);
	}
}
