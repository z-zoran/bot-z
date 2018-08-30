"use strict";

module.exports = async function dohvatiNotesHendler(mongo, arg) {
    
    // UBACITI LOGIKU DOHVAĆANJA NOTESA

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