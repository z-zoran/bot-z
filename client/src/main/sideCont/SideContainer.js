import React, { Component } from 'react';
import { Konzola } from './Konzola.js';
import { Menu } from './Menu.js';
import './SideContainer.css';

export class SideContainer extends Component {
	render() {
		return (
			<div id="Side">
				<Konzola view={this.props.view} content={this.props.sideCont} hendleri={this.props.hendleri} />
				<Menu menu={this.props.menu} hendleri={this.props.hendleri} />
			</div>
		);
	}
}