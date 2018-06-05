const express = require('express');
const app = express();


/* SERVER API */

br = 0
// glavni callback za express router
function masterHendler(request, response) {
    br += 1;
    response.send(JSON.stringify(br));
}

// express router
app.use('/', masterHendler);

// uvo sluša
app.listen(3001, () => console.log('Example app listening on port 3001!'));