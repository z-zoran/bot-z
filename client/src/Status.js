import React, { Component } from 'react';

export class Status extends Component {
	render() {
		let statId = this.props.stat === 'Status: Online' ? "Header-status-online" : "Header-status-offline";
		return (
			<h3 id={statId} onClick={this.props.handleClick}>
				{this.props.stat}
			</h3>
		)
	}
}
