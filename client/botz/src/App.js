import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Menu } from './Menu.js'

class App extends Component {
	render() {
		return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h1>Testis 123</h1>
				<Menu />
			</header>
			<div className="App-container">
				<div className="App-chart">
					<p>Ovdje će biti čart.</p>
				</div>
				<div className="App-menu">
					<p>Ovdje će biti meni.</p>
				</div>
			</div>
		</div>
		);
	}
}

export default App;
