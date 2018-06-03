import React, { Component } from 'react';

export class Gumb extends Component {
	render() {
		return (
			<div className="Menu-gumb" onClick={this.props.handleClick}>
				<h3 className="Gumb-tekst">{this.props.ime}</h3>
			</div>
		);
	}
}
