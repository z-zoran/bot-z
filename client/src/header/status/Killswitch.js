import React, { Component } from 'react';

export class Killswitch extends Component {
	render() {
		return (
			<div id="Header-status-killswitch" onClick={this.props.handleClick}>
				{this.props.stat === 'Online'
				? 'KILLSWITCH'
				: 'POKRENI'}
			</div>
		)
	}
}
