import React, { Component } from 'react';
import { Gumb } from './Gumb.js';
import { Konzola } from './Konzola.js';

export class Menu extends Component {
	render() {
		return (
			<div id="App-menu">
				<Konzola />
				{this.props.cont.map(gumb => <Gumb ikona={gumb.ikona} handleClick={gumb.handleClick} ime={gumb.ime} />)}
			</div>
		);
	}
}
