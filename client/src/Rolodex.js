import React, { Component } from 'react';
import { Karta } from './Karta.js'

export class Rolodex extends Component {
	render() {
		return (
			<div id="Header-notif">
				{this.props.cont.map(kartica => <Karta cont={kartica} handleClick={this.props.handleClick}/>)}
			</div>
		)
	}
}
