import React, { Component } from 'react';

export class PlayRez extends Component {
	constructor(props) {
		super(props);
		this.rezolucije = [ 'min1', 'min5', 'min15', 'min60' ];
	}
	render() {
		return (
			<div id="Play-rez">
				{this.rezolucije.map(rez => 
					<label className="Play-rez-cont" defaultChecked={this.props.rez} >
						<input className="Play-rez-radio" type="radio" name="rez" value={rez} onClick={() => this.props.handleChange(rez)} checked={this.props.rez === rez} />
						<span className="Play-rez-tekst">{rez.slice(3, rez.length) + 'min'}</span>
					</label>
				)}
				{'Rezolucija: ' + this.props.rez.slice(3, this.props.rez.length) + 'min'}
			</div>
		);
	}
}
