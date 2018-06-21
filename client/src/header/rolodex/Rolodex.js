import React, { Component } from 'react';
import { Karta } from './Karta.js';
import './Rolodex.css';

export class Rolodex extends Component {
	render() {
		return (
			<div id="Header-rolodex">
				{this.props.karte.map(kartica => <Karta key={kartica.timestamp.toString()} content={kartica} handleClick={() => this.props.hendleri.handleRolodex(kartica.id)}/>)}
			</div>
		)
	}
}
