import React, { Component } from 'react';

export class Status extends Component {
	render() {
		return (
			<div id="Header-status">
				{this.props.status}
			</div>
		)
	}
}
