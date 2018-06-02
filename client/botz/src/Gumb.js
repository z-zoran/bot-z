import React, { Component } from 'react';

export class Gumb extends Component {
	render() {
		return (
			<div className="Menu-gumb" onClick={this.handleClick}>
				<p className="Gumb-tekst"> {this.props.ime} </p>
			</div>
		);
	}
}
