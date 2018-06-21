import React, { Component } from 'react';

export class Karta extends Component {
	render() {
		return (
			<div className="Notif-karta" onClick={this.props.handleClick}>
				<p id="Karta-timestamp">{this.props.cont.timestamp}</p>
				<p id="Karta-symbol">{this.props.cont.symbol}</p>
				<p id="Karta-strat">{this.props.cont.strat}</p>
				<p id="Karta-profit">{this.props.cont.profit}</p>
			</div>
		);
	}
}
