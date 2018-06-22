"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// MONGO podaci
const mongo = {
    Client: require('mongodb').MongoClient,
    dbUrl: 'mongodb://localhost:27017',
    dbName: 'baza',
}
// import hendleri
const dajKendloveHendler = require('./hendleri/dajKendloveHendler.js');
const napraviBektest = require('./hendleri/napraviBektest.js');

/* SERVER API */

// middleware za parsanje bodyja
app.use(bodyParser.json());

// master hendler
async function masterHendler(request, response) {
    switch (request.body.zahtjev) {
        case 'dajKendlove':
            let kendlovi = await dajKendloveHendler(mongo, request.body);
            response.json(kendlovi);
            break;
        case 'napraviBektest':
            let rezultati = await napraviBektestHendler(mongo, request.body);
            response.json(rezultati);
        case 'viewNotes':
            let notes = await dohvatiNotesHendler(mongo, request.body);
            response.json(notes);
        case 'postNotes':
            let notes = await postajNotesHendler(mongo, request.body);
            response.json(notes);
        default:
            response.json('Nije dobar zahtjev ili nešto: ' + JSON.stringify(request.body))
    }
}
/**** API ****

report:
    reportHandler(mongo, {}) => {callbackovi}
    // frontend ima setInterval koji svaku sekundu zove report
    // server provjerava treba li frontend išta zatražiti
    // vraća frontendu popis stvari koje treba zatražiti
    // frontend dohvaća potrebne updateove
dajKendlove: 
    dajKendloveHendler(mongo, {kolekcija, start, koliko}) => [kendlovi]
    // radi što bi i očekivao
napraviBektest: 
    napraviBektestHendler(mongo, {bektest}) => {rezultati}
        bektest: {btID, [kolekcije], start, period, strategija}
            strategija: {ime, postavke}
        rezultati: {ovisno o strategiji}
    // obavi podešenu strategiju na zadanoj kolekciji i periodu

viewNotes: 
    dohvatiNotesHendler(mongo, {opcije}) => {notes}
        opcije: {sortBy, sortAsc, subselektor}
            subselektor: [kategorije]
    // dohvaća cijeli notes
postNotes: 
    postajNotesHendler(mongo, {nota}) => {notes}
        nota: {timestamp, prioritet, kategorija, naslov, tekst}
            kategorija: "strat ideja" / "app ideja" / "opservacija" / ...
    // sprema notu u notes, vraća notes
viewArhiv:
    dohvatiArhivHendler(mongo, {}) => {arhiv}
    // dohvaća arhivirane note
putArhiv:
    arhivirajNotuHendler(mongo, {nota}) => {arhiv/notes}
    // briše iz notesa i stavlja u arhiv ili obratno
    // vraća notes ako arhiviramo iz notesa, a arhiv ako vraćamo iz arhiva

pokreniSimulaciju:
    pokreniSimulacijuHendler(mongo, {portfolio}) => {info} // + pretplati se na report
        portfolio: {pfID, live(=false), [kolekcije], strategija}
pokreniLive:
    pokreniLiveHendler(mongo, {portfolio}) => {info} // + pretplati se na report
        portfolio: {pfID, live(=true), [kolekcije], strategija}

*/

// express router
app.post('/', masterHendler);

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));