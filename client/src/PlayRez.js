import React, { Component } from 'react';

export class PlayRez extends Component {
	constructor(props) {
		super(props);
	}
	hendlerPromjene() {
		this.props.handleChange
	}
	render() {
		return (
			<div id="Play-rez">
				<form value={this.props.rez} onChange={this.hendlerPromjene}>
					<input type="radio" name="rez" value="min1" /><span>1min</span>
					<input type="radio" name="rez" value="min5" /><span>5min</span>
					<input type="radio" name="rez" value="min15" /><span>15min</span>
					<input type="radio" name="rez" value="min60" /><span>60min</span>
				</form>			
			</div>
		);
	}
}
