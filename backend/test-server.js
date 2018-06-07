const express = require('express');
const app = express();


/* SERVER API */

// master hendler
function masterHendler(request, response) {
    console.log('Blaaa');
    response.send('Evo me');
}

// express router
app.get('/', masterHendler);

// uvo sluša
app.listen(873, () => console.log('Example app listening on port 873!'));