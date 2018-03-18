"use strict"

// MODUL ZA FIDANJE KENDLOVA U BEKTESTER.
// LAYER ISPOD JE AGREGATOR. IZNAD JE BEKTESTER.

let kendlInput = require('./zAggry.js');
let kendlovi = kendlInput;

// data paket za chartove
let chDataPaket = {};
chDataPaket.chData1min = [];
chDataPaket.chData5min = [];
chDataPaket.chData15min = [];
chDataPaket.chData1h = [];

// inicijalizacija svih kauntera (svaki za svoj vremenski okvir)
let chartKontrole = {};
let i1 = chartKontrole.i1 = 0;
let i5 = chartKontrole.i5 = 0;
let i15 = chartKontrole.i15 = 0;
let i60 = chartKontrole.i60 = 0;

// inicijalni feed da se popune paketi.
for (let i = 0; i < 5000; i++) {
	chDataPaket = fiderKendlova(chDataPaket);
}
// konvertiramo pakete u config za chart
let config = konverterZaChart(chDataPaket);

/* onclick metode za fast forward i rewind */
chartKontrole.napred24h = function () {
	i1 += 1440; // 24 * 60  1min
	i5 += 288; // 24 * 12  5min
	i15 += 96; // 24 * 4  15min
	i60 += 24;	// 24 * 1  60min
	alert("Napred 24 sata");
}

chartKontrole.nazad24h = function () {
	alert("Nazad 24 sata");
}

chartKontrole.napred1h = function () {
	alert("Napred 1 sat");
}

chartKontrole.nazad1h = function () {
	alert("Nazad 1 sat");
}

chartKontrole.napred15min = function() {
	alert("Napred 15 minuta");
}

chartKontrole.nazad15min = function() {
	alert("Nazad 15 min");
}


function fiderKendlova(chDataPaket) {
	// jedna iteracija funkcije za punjenje paketa za chartove.
	
	// punjenje 1min paketa	
	if (chDataPaket.chData1min.length === 50) {
		chDataPaket.chData1min.shift();
	}
	chDataPaket.chData1min.push(kendlovi.arr1min[i1]);
	i1++;

	// punjenje 5min paketa
	if (i1 % 5 === 0) {
		if (chDataPaket.chData5min.length === 50) {
			chDataPaket.chData5min.shift();
		} 
		chDataPaket.chData5min.push(kendlovi.arr5min[i5]);
		i5++;
	}

	// punjenje 15min paketa
	if (i1 % 15 === 0) {
		if (chDataPaket.chData15min.length === 50) {
			chDataPaket.chData15min.shift();
		} 
		chDataPaket.chData15min.push(kendlovi.arr15min[i15]);
		i15++;
	}

	// punjenje 60min (1h) paketa
	if (i1 % 60 === 0) {
		if (chDataPaket.chData1h.length === 50) {
			chDataPaket.chData1h.shift();
		} 
		chDataPaket.chData1h.push(kendlovi.arr1h[i60]);
		i60++;
	}
	return chDataPaket;
}



function konverterZaChart(paket) {
	let dejta = {};
	dejta.lejbeliVrijeme = [];
	dejta.dejtaO = [];
	dejta.dejtaH = [];
	dejta.dejtaL = [];
	dejta.dejtaC = [];
	for (let i = 0; i < paket.chData1min.length; i++) {
		let kendl = paket.chData1min[i];
		let vrijeme = kendl.datum + ' ' + kendl.sat + ':' + kendl.minuta;
		dejta.lejbeliVrijeme.push(vrijeme);
		dejta.dejtaO.push(kendl.O);
		dejta.dejtaH.push(kendl.H);
		dejta.dejtaL.push(kendl.L);
		dejta.dejtaC.push(kendl.C);
		
	}
	let config = {
		type: 'line',
		data: {
			labels: dejta.lejbeliVrijeme,
			datasets: [{
				label: 'O',
				//backgroundColor: '#cc0000',
				borderColor: '#cc9900',
				data: dejta.dejtaO,
				fill: false,
			}, {
				label: 'H',
				//backgroundColor: '#cc0000',
				borderColor: '#009933',
				data: dejta.dejtaH,
				fill: false,
			}, {
				label: 'L',
				//backgroundColor: '#cc0000',
				borderColor: '#cc0000',
				data: dejta.dejtaL,
				fill: false,
			}, {
				label: 'C',
				//backgroundColor: '#cc0000',
				borderColor: '#3333ff',
				data: dejta.dejtaC,
				fill: false,
			}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: '1min - test'
			},
			tooltips: {
				mode: 'index',
				intersect: false,
			},
			hover: {
				mode: 'nearest',
				intersect: true
			},
			scales: {
				xAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Vrijeme'
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Cijena'
					}
				}]
			}
		}
	};
	return config;
}

module.exports.config = config;
module.exports.kontrole = chartKontrole;