const express = require('express');
const app = express();
const bodyParser = require('body-parser');


/* SERVER API */

// middleware za parsanje bodyja
app.use(bodyParser.json());

// master hendler
function masterHendler(request, response) {
    
    response.json(request.body);
}

// express router
app.post('/', masterHendler);

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));