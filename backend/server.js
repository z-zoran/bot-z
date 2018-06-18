const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// MONGO podaci
const mongo = {
    Client: require('mongodb').MongoClient,
    dbUrl: 'mongodb://localhost:27017',
    dbName: 'baza',
}

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
        default:
            response.json('Nije dobar zahtjev ili nešto: ' + JSON.stringify(request.body))
    }
}

async function dajKendloveHendler(mongo, arg) {
    let client, db, array;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
        db = client.db(mongo.dbName);
		array = await db
			.collection(arg.kolekcija)
			.find({openTime: {$gte: arg.start}}, {_id: 0})
			.sort({openTime: 1})
			.limit(arg.koliko)
			.toArray();
    } catch (err) {
        throw new Error(err);
    }
	client.close();
	return array;
}

// express router
app.post('/', masterHendler);

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));