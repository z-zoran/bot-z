const express = require('express');
const app = express();


/* SERVER API */

// glavni callback za express router
async function masterHendler(request, response) {
    response.send(JSON.stringify(Date.now() + ' ' + await request.json()));
}

// express router
app.post('/', masterHendler);

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));