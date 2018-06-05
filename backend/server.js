const express = require('express');
const app = express();


/* SERVER API */
br = ''
// glavni callback za express router
function masterHendler(request, response) {
    br += 'bla bla 123 ';
    response.send(br);
}


app.get('/', masterHendler);

app.listen(3001, () => console.log('Example app listening on port 3001!'));