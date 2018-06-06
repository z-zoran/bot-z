const express = require('express');
const app = express();
const bodyParser = require('body-parser');


/* SERVER API */

// middleware za parsanje bodyja
app.use(bodyParser.json());

// express router
app.post('/', function (request, response) {
    response.json(request.body);
});

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));