"use strict";

// Library sa strategijama
// Logika koja se vrti sa svakom novom informacijom s burze.

/*-------------------REQUIRE------------------*/

let memorija = require('./memorija.js');

// lib sa indikatorima
let indikator = require('./indikator.js');

// definiramo module.exports objekt "strat" u koji ćemo sve trpati 
let strat = {};

let pisalo = require('./pisalo.js');

/*--------------------KORISNE UTIL FUNKCIJE----------------------*/
const util = require('./util.js');
const odnosTriBroja = util.odnosTriBroja;
const limitDataTemplate = util.limitDataTemplate;


/*-----------------------STRATEGIJA: JAHANJE CIJENE-----------------------*/
// THE strategija
strat.stratJahanjeCijene = function stratJahanjeCijene(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau, koefKappa) {  // strategija za jahanje cijene 
    // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
    let sellLimit = portfolio.limiti.sell;
    let buyLimit = portfolio.limiti.buy;
    let nemaNijedanLimit = (!sellLimit && !buyLimit);
    let imaObaLimita = (sellLimit && buyLimit);
    let imaSamoBuyLimit = (!sellLimit && buyLimit);
    let imaSamoSellLimit = (sellLimit && !buyLimit);

    /** PRVO VRŠIMO KOREKCIJE I ELIMINACIJE **/
    portfolio.provjeriTrailere(cijenaSad);
    portfolio.obaviKillove(cijenaSad, koefKappa);
    portfolio.provjeriStopove(cijenaSad, odmakTau);
    portfolio.provjeriLimite(cijenaSad, odmakLambda, iznos);
    /** KRAJ KOREKCIJA I ELIMINACIJA **/

    /** ONDA RE-EVALUIRAMO TRENUTNO STANJE **/
    // (gledamo koji limiti-sleš-stopovi postoje)

    if (buyLimit && stopKojiJeIznad) {

    } else if (sellLimit && stopKojiJeIspod) {
        
    }

    /*-opcija 1--------------AKO NEMA NIJEDAN LIMIT-----------------------*/
    if (nemaNijedanLimit) {
        portfolio.postLimit(new limitDataTemplate(portfolio.portfolio, 'sell', 'ETH/EUR', iznos, (cijenaSad + odmakLambda)));
        portfolio.postLimit(new limitDataTemplate(portfolio.portfolio, 'buy', 'ETH/EUR', iznos, (cijenaSad - odmakLambda)));
    /*-opcija 2--------------AKO IMA DVA LIMITA-----------------------*/
    } else if (imaObaLimita) {
        let gornjaLimitCijena = portfolio.limiti.sell.limitCijena;
        let donjaLimitCijena = portfolio.limiti.buy.limitCijena;
        let triggeranSellLimit = (gornjaLimitCijena < cijenaSad);
        let triggeranBuyLimit = (donjaLimitCijena > cijenaSad);
        let cijenaJeGore = (odnosTriBroja(gornjaLimitCijena, cijenaSad, donjaLimitCijena) > 50) && !triggeranSellLimit;
        let cijenaJeDole = (odnosTriBroja(gornjaLimitCijena, cijenaSad, donjaLimitCijena) < 50) && !triggeranBuyLimit;
        // korekcija udaljenijeg limita
        if (cijenaJeGore) {
            let novaBuyLimitCijena = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = novaBuyLimitCijena > donjaLimitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(portfolio.limiti.buy)); 
                noviLimitData.limitCijena = novaBuyLimitCijena;
                portfolio.ubiLimit('buy');
                portfolio.postLimit(noviLimitData);
            }
        } else if (cijenaJeDole) {
            let novaSellLimitCijena = cijenaSad + odmakLambda;
            let trebaPomaknutiLimit = novaSellLimitCijena < gornjaLimitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(portfolio.limiti.sell)); 
                noviLimitData.limitCijena = novaSellLimitCijena;
                portfolio.ubiLimit('sell');
                portfolio.postLimit(noviLimitData);
            }
        } else if (triggeranBuyLimit) {
            let noviLimitData = JSON.parse(JSON.stringify(portfolio.limiti.buy));
            noviLimitData.iznos = iznos;
            noviLimitData.limitCijena = cijenaSad - odmakLambda;
            portfolio.postPoziciju('buy', odmakPhi);
            portfolio.postLimit(noviLimitData);
            portfolio.ubiLimit('sell'); // brišemo sell jer pozicija ima stop
        } else if (triggeranSellLimit) {
            let noviLimitData = JSON.parse(JSON.stringify(portfolio.limiti.sell));
            noviLimitData.iznos = iznos;
            noviLimitData.limitCijena = cijenaSad + odmakLambda;
            portfolio.postPoziciju('sell', odmakPhi);
            portfolio.postLimit(noviLimitData);
            portfolio.ubiLimit('buy'); // brišemo buy jer pozicija ima stop

        }
    /*-opcija 3--------------AKO IMA SAMO BUY LIMIT-----------------------*/
    } else if (imaSamoBuyLimit) {
        let pozCounterString;
        let najniziStop = 10000000;
        // traženje pozicije s najnižim stopom
        for (let i in portfolio.pozicije) {
            if (portfolio.pozicije[i].stop && (portfolio.pozicije[i].stop < najniziStop)) {
                najniziStop = portfolio.pozicije[i].stop;
                pozCounterString = i;
            }
        }
        let zadnjaPozicijaSaStopom = portfolio.pozicije[pozCounterString];
        let stopTriggerIznadJeTriggeran = (zadnjaPozicijaSaStopom.tip === 'buy') && (cijenaSad > zadnjaPozicijaSaStopom.stop);  // prvi uvjet redundantan, ali neka ga
        let triggeranBuyLimit = (buyLimit.limitCijena > cijenaSad);
        let buyLimitPostojiAliDalekoJe = (odnosTriBroja(zadnjaPozicijaSaStopom.stop, cijenaSad, buyLimit.limitCijena) > 50);
        /*----------------------STOP TRIGGER IZNAD JE TRIGGERAN?-----------------------*/
        if (stopTriggerIznadJeTriggeran) {
            zadnjaPozicijaSaStopom.stopTriggeran(odmakTau); // stvori trailer
            // popravi buy limit ako treba
            let novaBuyLimitCijena = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = novaBuyLimitCijena > buyLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(buyLimit)); 
                noviLimitData.limitCijena = novaBuyLimitCijena;
                portfolio.ubiLimit('buy');
                portfolio.postLimit(noviLimitData);
            }
            // provjeri da li ima uopće stop triggera još
            let nemaNijedanStopTrigger = true;
            for (let poz in portfolio.pozicije) {
                if (portfolio.pozicije[poz].stop) {
                    nemaNijedanStopTrigger = false;
                    break;
                }
            }
            // ako nema više stop triggera (iznad cijene nema ničega), stvaramo novi sell limit
            if (nemaNijedanStopTrigger) {
                let limitData = JSON.parse(JSON.stringify(buyLimit));
                limitData.tip = 'sell';
                limitData.iznos = iznos;
                limitData.limitCijena = cijenaSad + odmakLambda;
                portfolio.postLimit(limitData);
            }
        /*-----------------------BUY LIMIT JE TRIGGERAN?-----------------------*/     
        } else if (triggeranBuyLimit) {
            let noviLimitData = JSON.parse(JSON.stringify(buyLimit));
            noviLimitData.iznos = iznos;
            noviLimitData.limitCijena = cijenaSad - odmakLambda;
            portfolio.postPoziciju('buy', odmakPhi);
            portfolio.postLimit(noviLimitData);
        /*-----------------------BUY LIMIT NAM JE DALEKO?-----------------------*/      
        } else if (buyLimitPostojiAliDalekoJe) {
            // korekcija buy limita
            let novaBuyLimitCijena = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = novaBuyLimitCijena > buyLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(buyLimit)); 
                noviLimitData.limitCijena = novaBuyLimitCijena;
                portfolio.ubiLimit('buy');
                portfolio.postLimit(noviLimitData);
            }
        }
    /*-opcija 4--------------AKO IMA SAMO SELL LIMIT-----------------------*/
    } else if (imaSamoSellLimit) {
        let pozCounterString;
        let najvisiStop = 0;
        // traženje pozicije s najnižim stopom
        for (let i in portfolio.pozicije) {
            if (portfolio.pozicije[i].stop && (portfolio.pozicije[i].stop > najvisiStop)) {
                najvisiStop = portfolio.pozicije[i].stop;
                pozCounterString = i;
            }
        }
        let zadnjaPozicijaSaStopom = portfolio.pozicije[pozCounterString];
        let stopTriggerIspodJeTriggeran = (zadnjaPozicijaSaStopom.tip === 'sell') && (cijenaSad < zadnjaPozicijaSaStopom.stop);  // prvi uvjet redundantan, ali neka ga
        let triggeranSellLimit = (sellLimit.limitCijena < cijenaSad);
        let sellLimitPostojiAliDalekoJe = (odnosTriBroja(sellLimit.limitCijena, cijenaSad, zadnjaPozicijaSaStopom.stop) < 50);
        /*----------------------STOP TRIGGER ISPOD JE TRIGGERAN?-----------------------*/
        if (stopTriggerIspodJeTriggeran) {
            zadnjaPozicijaSaStopom.stopTriggeran(odmakTau); // stvori trailer
            // popravi sell limit ako treba
            let novaSellLimitCijena = cijenaSad + odmakLambda;
            let trebaPomaknutiLimit = novaSellLimitCijena < sellLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(sellLimit)); 
                noviLimitData.limitCijena = novaSellLimitCijena;
                portfolio.ubiLimit('sell');
                portfolio.postLimit(noviLimitData);
            }
            // provjeri da li ima uopće stop triggera još
            let nemaNijedanStopTrigger = true;
            for (let poz in portfolio.pozicije) {
                if (portfolio.pozicije[poz].stop) {
                    nemaNijedanStopTrigger = false;
                    break;
                }
            }
            // ako nema više stop triggera (ispod cijene nema ničega), stvaramo novi buy limit
            if (nemaNijedanStopTrigger) {
                let limitData = JSON.parse(JSON.stringify(sellLimit));
                limitData.tip = 'buy';
                limitData.iznos = iznos;
                limitData.limitCijena = cijenaSad - odmakLambda;
                portfolio.postLimit(limitData);
            }
        /*-----------------------SELL LIMIT JE TRIGGERAN?-----------------------*/     
        } else if (triggeranSellLimit) {
            let noviLimitData = JSON.parse(JSON.stringify(sellLimit));
            noviLimitData.iznos = iznos;
            noviLimitData.limitCijena = cijenaSad + odmakLambda;
            portfolio.postPoziciju('sell', odmakPhi);
            portfolio.postLimit(noviLimitData);
        /*-----------------------SELL LIMIT NAM JE DALEKO?-----------------------*/      
        } else if (sellLimitPostojiAliDalekoJe) {
            // korekcija sell limita
            let novaSellLimitCijena = cijenaSad + odmakLambda;
            let trebaPomaknutiLimit = novaSellLimitCijena < sellLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(sellLimit)); 
                noviLimitData.limitCijena = novaSellLimitCijena;
                portfolio.ubiLimit('sell');
                portfolio.postLimit(noviLimitData);
            }
        }
    } // zatvaranje zadnje opcije
} // zatvaranje cijele funkcije

module.exports = strat;