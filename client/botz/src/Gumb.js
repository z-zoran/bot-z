import React, { Component } from 'react';


export class Gumb extends Component {
	render() {
		return (
			<button name="favorite" type="button">
				<svg aria-hidden="true" viewBox="0 0 10 10"><path d="m7.4 8.8-2.4-1.3-2.4 1.3.46-2.7-2-1.9 2.7-.39 1.2-2.5 1.2 2.5 2.7.39-1.9 1.9z"/></svg>
				Add to favorites
			</button>
		);
	}
}
