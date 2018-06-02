import React, { Component } from 'react';
import { Karta } from './Karta.js'

export class Rolodex extends Component {
	ubaciContent(cont) {
		return cont.map(kartica => <Karta cont={kartica} />)
	}
	render() {
		return (
			<div id="Header-notif">
				{this.ubaciContent(this.props.cont)}
			</div>
		)
	}
}
