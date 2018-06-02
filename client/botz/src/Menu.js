import React, { Component } from 'react';
import { Gumb } from './Gumb.js';

export class Menu extends Component {
	render() {
		return (
			<div id="App-menu">
				<Gumb handleClick={this.props.handleClick} ime="Backtest" />
				<Gumb handleClick={this.props.handleClick} ime="Portfolio" />
				<Gumb handleClick={this.props.handleClick} ime="Stratovi" />
				<Gumb handleClick={this.props.handleClick} ime="Live" />
				<Gumb handleClick={this.props.handleClick} ime="Killswitch" />
			</div>
		);
	}
}
