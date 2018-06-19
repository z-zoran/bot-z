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
            let rezultati = await napraviBektest(mongo, request.body);
            response.json(rezultati);
        case 'notesView':
            let notes = await dohvatiNotes(mongo, request.body);
            response.json(notes);
        case 'notesPost':
            let notes = await postajNotes(mongo, request.body);
            response.json(notes);
        default:
            response.json('Nije dobar zahtjev ili nešto: ' + JSON.stringify(request.body))
    }
}

// express router
app.post('/', masterHendler);

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));