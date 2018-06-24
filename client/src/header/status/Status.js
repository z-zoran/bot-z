import React, { Component } from 'react';
import { Killswitch } from './Killswitch';
import './Status.css';

export class Status extends Component {
	render() {
		let statId = this.props.status === 'Online' ? "Status-online" : "Status-offline";
		return (
			<div id="Header-status">
				<img src={this.props.ikona} id={this.props.status === 'Online' ? 'Status-ikona-on' : 'Status-ikona-off'} alt="Status" />
				<Killswitch status={this.props.status} handleClick={this.props.handleClick} />
				<span id="Status-status">STATUS</span>
				<span id={statId}>
					{this.props.status.toUpperCase()}
				</span>
			</div>
		)
	}
}
