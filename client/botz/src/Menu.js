import React, { Component } from 'react';
import { Gumb } from './Gumb.js';

export class Menu extends Component {
	render() {
		return (
		<div className="Menu">
			<Gumb />
			<Gumb />
			<Gumb />
			<Gumb />
			<Gumb />
		</div>
		);
	}
}
