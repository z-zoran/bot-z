import React, { Component } from 'react';
import { Gumb } from './Gumb.js';

export class Menu extends Component {
	render() {
		return (
			<div id="Side-menu">
				{this.props.menu.map(gumb => <Gumb key={gumb.ime} ikona={gumb.ikona} handleClick={() => this.props.hendleri.handleView(gumb.ime)} ime={gumb.ime} />)}
			</div>
		);
	}
}
