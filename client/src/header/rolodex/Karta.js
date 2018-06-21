import React, { Component } from 'react';

export class Karta extends Component {
	render() {
		return (
			<div className="Rolodex-karta" onClick={this.props.handleClick}>
				<p id="Karta-timestamp">{this.props.content.timestamp}</p>
				<p id="Karta-symbol">{this.props.content.symbol}</p>
				<p id="Karta-strat">{this.props.content.strat}</p>
				<p id="Karta-profit">{this.props.content.profit}</p>
			</div>
		);
	}
}
