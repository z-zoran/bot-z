import React, { Component } from 'react';

export class Killswitch extends Component {
	render() {
		return (
			<div id="Status-killswitch" onClick={this.props.handleClick}>
				{this.props.status === 'Online'
				? 'KILLSWITCH'
				: 'POKRENI'}
			</div>
		)
	}
}
