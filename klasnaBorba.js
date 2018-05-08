"use strict";

// Library s klasama. WIP
// portfolio je ustvari "glavna pozicija" u koju vraćamo sve slobodne pozicije. 
// Vezana za strategiju. Svaka strategija imati će svoj portfolio (ili više njih).

let memorija = require('./memorija.js');
let pisalo = require('./pisalo.js');
const alatke = require('./alatke.js');
const odnosTriBroja = alatke.odnosTriBroja;
const limitDataTemplate = alatke.limitDataTemplate;

// OBJEKT ZA EXPORT
let klas = {};




/*********** KONSTRUKTORI KLASA ***********/

// KLASA ZA PORTFOLIO
klas.Portfolio = function Portfolio(pfID, eur, eth, btc, ltc, bch) {
	this.pfID = pfID;
	this.EUR = eur;
	this.ETH = eth;
	this.BTC = btc;
	this.LTC = ltc;
	this.BCH = bch;
	this.pozCounter = 0;
	this.limitCounter = 0;
	this.limiti = {};
	this.pozicije = {};
	this.traileri = {};
	this.imaStopova = false;
}

// KLASA ZA LIMIT ORDERE
klas.LimitOrder = function LimitOrder(id, limitData) {
	this.pfID = limitData.pfID;
	this.id = id;	
	this.tip = limitData.tip;
	this.market = limitData.market;
	this.baseTiker = limitData.market.split('/')[0];
	this.quoteTiker = limitData.market.split('/')[1];
	this.iznos = limitData.iznos;
	this.limitCijena = limitData.limitCijena;
	this.umnozak = limitData.iznos * limitData.limitCijena;
}

// KLASA ZA POZICIJE
klas.Pozicija = function Pozicija(id, pozData) {
	this.pfID = pozData.pfID;
	this.id = id;	
	this.tip = pozData.tip;	// buy || sell
	this.market = pozData.market;
	this.baseTiker = pozData.baseTiker;
	this.base = pozData.base;	// iznos limita
	this.quoteTiker = pozData.quoteTiker;
	this.quote = pozData.quote;	// umnožak
	this.cijena = pozData.cijena;
	this.stop = pozData.stop;
}

// KLASA ZA TRAILERE
klas.Trailer = function Trailer(trailerData) {
	this.pfID = trailerData.pfID;
	this.id = trailerData.id;				// izvorna pozicija
	this.cijena = trailerData.cijena;		// ulazna cijena pozicije
	this.odmak = trailerData.odmak;			// odmak trailera (pozitivan ili negativan)
	this.gdjeSam = this.cijena + this.odmak;	// na kojoj cijeni je trenutno trailing stop
	/* Kad se trailer inicira, postavlja se s odmakom od cijene. 
	Svaki candle zovemo svim Trailerima metodu .trailerKorekcija koja podešava trailing stop. */
}




/*********** METODE Portfolio ***********/

// METODA ZA POSTAVLJANJE LIMITA
klas.Portfolio.prototype.postLimit = function postLimit(limitData) {
	this.limiti[limitData.tip] = {};	// iniciramo novi ili brišemo stari limit
	this.limitCounter += 1; 	// povečavamo counter za limit id
	let limitCounterString = (this.limitCounter.toString()).padStart(4, "0");
	let baseTiker = limitData.market.split('/')[0];
	let quoteTiker = limitData.market.split('/')[1];
	let umnozak = limitData.iznos * limitData.limitCijena;
	let poruka = '';
	if (limitData.tip === 'buy') {
		// provjera imamo li dovoljno quote u portfoliu za kupiti base
		if (this[quoteTiker] < umnozak) {
			poruka = 'BANKROT! Nema dovoljno quote-a za postavljanje buy limita. LimitID: ' + limitCounterString;
		} else {
			// exchange komunikacija
			this[quoteTiker] -= umnozak;
			this.limiti.buy = new klas.LimitOrder(limitCounterString, limitData);
			poruka = 'BUY LIMIT POSTAVLJEN. LimitID: ' + limitCounterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else if (limitData.tip === 'sell') {
		// provjera imamo li dovoljno base u portfoliu za prodaju 
		if (this[baseTiker] < limitData.iznos) {
			poruka = 'BANKROT! Nema dovoljno base-a za postavljanje sell limita. LimitID: ' + limitCounterString;
		} else {
			// exchange komunikacija
			this[baseTiker] -= limitData.iznos;
			this.limiti.sell = new klas.LimitOrder(limitCounterString, limitData);
			poruka = 'SELL LIMIT POSTAVLJEN. LimitID: ' + limitCounterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else {
		poruka = 'ERROR! limitData nije dobro formatiran. LimitID: ' + limitCounterString;
	}
	// pisalo.pisi(poruka);
}

// METODA ZA UBIJANJE LIMITA
klas.Portfolio.prototype.ubiLimit = function ubiLimit(koji) {
    // exchange komunikacija
	let poruka = '';
	if (koji === 'buy') {
		this[this.limiti.buy.quoteTiker] += this.limiti.buy.umnozak;
		delete this.limiti.buy;
		poruka = 'BUY LIMIT UBIJEN.';
	} else if (koji === 'sell') {
		this[this.limiti.sell.baseTiker] += this.limiti.sell.iznos;
		delete this.limiti.sell;
		poruka = 'SELL LIMIT UBIJEN.'
	}
	// pisalo.pisi(poruka);
}

// METODA ZA REALIZACIJU LIMIT ORDERA, ODNOSNO ZA STVARANJE POZICIJE
klas.Portfolio.prototype.postPoziciju = function postPoziciju(koja, odmakPhi) {
	// definiramo pozData za stvaranje nove pozicije.
	let pozData = {
		pfID: this.pfID,
		tip: koja,
		market: this.limiti[koja].market,
		baseTiker: this.limiti[koja].baseTiker,
		base: this.limiti[koja].iznos,
		quoteTiker: this.limiti[koja].quoteTiker,
		quote: this.limiti[koja].umnozak,
		cijena: this.limiti[koja].umnozak / this.limiti[koja].iznos
	}
	if (koja === 'buy') {
		pozData.stop = pozData.cijena + odmakPhi;
	} else if (koja === 'sell') {
		pozData.stop = pozData.cijena - odmakPhi;
	}
	this.pozCounter += 1; 	// povečavamo counter za id pozicije
	let pozCounterString = (this.pozCounter.toString()).padStart(4, "0");
	this.pozicije[pozCounterString] = new klas.Pozicija(pozCounterString, pozData);
	delete this.limiti[koja];
}

// METODA ZA PROVJERU SVIH STOPOVA
klas.Portfolio.prototype.provjeriStopove = function provjeriStopove(cijenaSad, odmakTau) {
	for (let pozID in this.pozicije) {
        let poz = this.pozicije[pozID];
        poz.stopCheck(cijenaSad, odmakTau);
    }
	this.imaStopova = false;
	for (let pozID in this.pozicije) {
		if (this.pozicije[pozID].stop) {
			this.imaStopova = true;
			break;
		}
	}
}

// METODA ZA UBIJANJE LOŠIH POZICIJA
klas.Portfolio.prototype.obaviKillove = function obaviKillove(cijenaSad, koefKappa) {
	for (let pozID in this.pozicije) {
		let poz = this.pozicije[pozID];
		poz.killCheck(cijenaSad, koefKappa);
	}
}

// METODA ZA PROVJERU SVIH TRAILERA
klas.Portfolio.prototype.provjeriTrailere = function provjeriTrailere(cijenaSad) {
	for (let trID in this.traileri) {
        let trailer = this.traileri[trID];
        trailer.trailerKorekcija(cijenaSad);
    }
}

// METODA ZA NAĆI NAJNIŽI STOP
klas.Portfolio.prototype.najnizaStopCijena = function najnizaStopCijena() {
	if (!this.imaStopova) return;
	let najnizaStopCijena = 1000000;
	for (let pozID in this.pozicije) {
		if (this.pozicije[pozID].stop < najnizaStopCijena) {
			najnizaStopCijena = this.pozicije[pozID].stop
		}
	}
	return najnizaStopCijena;
}

// METODA ZA NAĆI NAJVIŠI STOP
klas.Portfolio.prototype.najvisaStopCijena = function najvisaStopCijena() {
	if (!this.imaStopova) return;
	let najvisaStopCijena = 0;
	for (let pozID in this.pozicije) {
		if (this.pozicije[pozID].stop > najvisaStopCijena) {
			najvisaStopCijena = this.pozicije[pozID].stop
		}
	}
	return najvisaStopCijena;
}

// METODA ZA PROVJERU LIMITA
klas.Portfolio.prototype.provjeriLimite = function provjeriLimite(cijenaSad, iznos, odmakLambda, odmakPhi) {
	// provjera da li je neki limit triggeran
	if (this.limiti.buy) {
		if (this.limiti.buy.limitCijena > cijenaSad) {
			let noviLimitData = JSON.parse(JSON.stringify(this.limiti.buy));
			noviLimitData.iznos = iznos;
			noviLimitData.limitCijena = cijenaSad - odmakLambda;
			this.postPoziciju('buy', odmakPhi);
			this.postLimit(noviLimitData);
			if (this.limiti.sell) this.ubiLimit('sell'); // brišemo sell jer pozicija ima stop
		}
	}
	if (this.limiti.sell) {
		if (this.limiti.sell.limitCijena < cijenaSad) {
			let noviLimitData = JSON.parse(JSON.stringify(this.limiti.sell));
			noviLimitData.iznos = iznos;
			noviLimitData.limitCijena = cijenaSad + odmakLambda;
			this.postPoziciju('sell', odmakPhi);
			this.postLimit(noviLimitData);
			if (this.limiti.buy) this.ubiLimit('buy'); // brišemo buy jer pozicija ima stop
		}
	}
}

// tu je negdje greška koja poništi portfolio na samom početku jahanja
// METODA ZA KOREKCIJU LIMITA
klas.Portfolio.prototype.korigirajLimite = function korigirajLimite(cijenaSad, iznos, odmakLambda) {
	// provjera i obavljanje korekcije (približavanje limita)
	if (this.limiti.buy) {
		if ((cijenaSad - this.limiti.buy.limitCijena) > odmakLambda) {
			let noviLimitData = JSON.parse(JSON.stringify(this.limiti.buy)); 
			noviLimitData.limitCijena = cijenaSad - odmakLambda;
			this.ubiLimit('buy');
			this.postLimit(noviLimitData);
		}
	}
	if (this.limiti.sell) {
		if ((this.limiti.sell.limitCijena - cijenaSad) > odmakLambda) {
			let noviLimitData = JSON.parse(JSON.stringify(this.limiti.sell)); 
			noviLimitData.limitCijena = cijenaSad + odmakLambda;
			this.ubiLimit('sell');
			this.postLimit(noviLimitData);
		}
	}
	// dodavanje limita ako neki fali
    let nemaNijedanLimit = (!this.limiti.sell && !this.limiti.buy);
    let imaObaLimita = (this.limiti.sell && this.limiti.buy);
    let imaSamoBuyLimit = (!this.limiti.sell && this.limiti.buy);
    let imaSamoSellLimit = (this.limiti.sell && !this.limiti.buy);
    if (!this.imaStopova) {
        if (imaSamoBuyLimit) {
            let limitData = JSON.parse(JSON.stringify(this.limiti.buy));
            limitData.tip = 'sell';
            limitData.iznos = iznos;
            limitData.limitCijena = cijenaSad + odmakLambda;
            this.postLimit(limitData);
        } else if (imaSamoSellLimit) {
            let limitData = JSON.parse(JSON.stringify(this.limiti.sell));
            limitData.tip = 'buy';
            limitData.iznos = iznos;
            limitData.limitCijena = cijenaSad - odmakLambda;
            this.postLimit(limitData);
        } else if (nemaNijedanLimit) {
            this.postLimit(new limitDataTemplate(this.pfID, 'sell', 'ETH/EUR', iznos, (cijenaSad + odmakLambda)));
            this.postLimit(new limitDataTemplate(this.pfID, 'buy', 'ETH/EUR', iznos, (cijenaSad - odmakLambda)));
        } else if (imaObaLimita) {
            // sve ok!
        }
    }
}




/*********** METODE Pozicija ***********/

// METODA ZA TRIGGERANJE STOPA
klas.Pozicija.prototype.stopTriggeran = function stopTriggeran(odmak) {
	let trailerData = {
		pfID: this.pfID,
		id: this.id,
		cijena: this.cijena,
	}
	if (this.tip === 'buy') {
		trailerData.odmak = odmak * (-1);
	} else if (this.tip === 'sell') {
		trailerData.odmak = odmak;
	}
	memorija[this.pfID].traileri[this.id] = new klas.Trailer(trailerData);
	let poruka = 'Stop trigger ' + memorija[this.pfID].pozicije[this.id] + ' triggeran. Postavljen trailer.';
	// pisalo.pisi(poruka);
	delete this.stop;
}

// METODA ZA LIKVIDACIJU POZICIJE
klas.Pozicija.prototype.likvidacija = function likvidacija(cijenaSad) {
	if (this.tip === 'buy') {
		let prihod = this.base * cijenaSad;
		memorija[this.pfID][this.quoteTiker] += prihod;
	} else if (this.tip === 'sell') {
		let prihod = this.quote / cijenaSad;
		memorija[this.pfID][this.baseTiker] += prihod;
	}
	let poruka = 'Likvidirana pozicija ' + this.id;
	delete memorija[this.pfID].pozicije[this.id];
	// pisalo.pisi(poruka);
}

// METODA ZA ČEKIRANJE STOPA POZICIJE
klas.Pozicija.prototype.stopCheck = function stopCheck(cijenaSad, odmakTau) {
	if (this.stop) {
		let stopJeTriggeran = ((this.tip === 'buy') && (cijenaSad > this.stop)) || ((this.tip === 'sell') && (cijenaSad < this.stop));
		if (stopJeTriggeran) {
			this.stopTriggeran(odmakTau);
		}
	}
}

// METODA ZA ČEKIRANJE DA LI TREBA KILLAT POZICIJU
klas.Pozicija.prototype.killCheck = function killCheck(cijenaSad, koefKappa) {
	if (this.stop) {
		let inicijalnaUdaljenostStopa = Math.abs(this.stop - this.cijena);
		let trenutnaUdaljenostStopa = Math.abs(this.stop - cijenaSad);
		if (trenutnaUdaljenostStopa > (inicijalnaUdaljenostStopa * koefKappa)) {
			this.likvidacija(cijenaSad);
		}
	}
}


/*********** METODE Trailer ***********/

// METODA ZA KOREKCIJU TRAILERA
klas.Trailer.prototype.trailerKorekcija = function trailerKorekcija(cijenaSad) {
	let trenutnaUdaljenost = cijenaSad - this.gdjeSam;
	// logičke konstrukcije za čitkiji algoritam
	let pratimOdozdo = (this.odmak < 0);
	let pratimOdozgo = (this.odmak > 0);
	let iznadCijeneSam = (cijenaSad < this.gdjeSam);
	let ispodCijeneSam = (cijenaSad > this.gdjeSam);
	let cijenaMeTriggerala = (pratimOdozdo && iznadCijeneSam) || (pratimOdozgo && ispodCijeneSam);
	let cijenaMiJePobjegla = (Math.abs(trenutnaUdaljenost) > Math.abs(this.odmak));
	// algoritam korekcije
	let poruka = '';
	if (cijenaMeTriggerala) {
		poruka = 'Triggeran trailer id ' + this.id;
		memorija[this.pfID].pozicije[this.id].likvidacija(cijenaSad);
		delete memorija[this.pfID].traileri[this.id];
	} else if (cijenaMiJePobjegla) {
		poruka = 'Korekcija trailera id ' + this.id;
		this.gdjeSam = cijenaSad + this.odmak;
	}
	// pisalo.pisi(poruka);
}

module.exports = klas;
