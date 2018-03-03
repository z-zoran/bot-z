"use strict";

const http = require('http');
const fs = require('fs');

/*
//create a server object:
http.createServer(function (req, res) {
  res.write('Hello World!'); //write a response to the client
  res.end(); //end the response
}).listen(8080); //the server object listens on port 8080
*/

function plotty() {
	fs.readFile('./index.html', function (err, html) {
	    if (err) {
	        throw err; 
	    }       
	    http.createServer(function(request, response) {  
	        response.writeHeader(200, {"Content-Type": "text/html"});  
	        response.write(html);  
	        response.end();  
	    }).listen(8000);
	});
}

module.exports = plotty;