import React, { Component } from 'react';
import { Konzola } from './Konzola.js';
import { Menu } from './Menu.js'

export class SideContainer extends Component {
	render() {
		return (
			<div id="App-side">
				<Konzola />
				<Menu menu={this.props.menu} />
			</div>
		);
	}
}
