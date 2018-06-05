import React, { Component } from 'react';

export class Gumb extends Component {
	render() {
		return (
			<div className="Menu-gumb" onClick={this.props.handleClick}>
				<img src={this.props.ikona} className="Gumb-ikona" alt={this.props.ime} />
				<h4 className="Gumb-tekst">{this.props.ime}</h4>
			</div>
		);
	}
}
