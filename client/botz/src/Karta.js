import React, { Component } from 'react';

export class Karta extends Component {
	render() {
		return (
			<div className="Notif-karta" onClick={this.props.handleClick}>
				<p id="Karta-timestamp">{this.props.cont[0]}</p>
				<p id="Karta-symbol">{this.props.cont[1]}</p>
				<p id="Karta-strat">{this.props.cont[2]}</p>
				<p id="Karta-profit">{this.props.cont[3]}</p>
			</div>
		);
	}
}
