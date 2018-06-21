import React, { Component } from 'react';
import './Title.css';

export class Title extends Component {
	render() {
		return (
			<div id="Header-title">
				<img src={this.props.logo} id="Title-logo" alt="logo" />
				<h1 id="Title-name">Bot Z</h1>
			</div>
		);
	}
}
