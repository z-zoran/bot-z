import React, { Component } from 'react';
import { Killswitch } from './Killswitch';

export class Status extends Component {
	render() {
		let statId = this.props.stat === 'Online' ? "Header-status-online" : "Header-status-offline";
		return (
			<div id="Header-status">
				<img src={this.props.ikona} id="Header-status-ikona" alt="Status" />
				<span id="Header-status-status">STATUS</span>
				<span id={statId}>
					{this.props.stat.toUpperCase()}
				</span>
				<Killswitch onClick={this.props.handleClick} />
			</div>
		)
	}
}
