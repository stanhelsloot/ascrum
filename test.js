// Stan Helsloot
// Test file for creating server and extracting data from server.
var http = require('http');
var { parse } = require('querystring');
var sqlite3 = require('sqlite3').verbose();

// Create the page on the server using readfile function
var fs = require('fs');
http.createServer(function (req, res) {
  fs.readFile('kom-rugbyen.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
  // Extract posted data using the collectRequestData function
  if (req.method === 'POST') {
    collectRequestData(req, res => {
      convertData(res);
      // res.end(); ??? closing interaction?
    });
  }
}).listen(8888);

// Function for collection of data sourced on https://itnext.io/how-to-handle-the-post-request-body-in-node-js-without-using-a-framework-cd2038b93190
function collectRequestData(req, callback) {
    var FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(req.headers['content-type'] === FORM_URLENCODED) {
        var body = '';
        req.on('data', input => {
          body += input.toString();
        });
        req.on('end', () => {
          callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

// Converting the data to database ready input
function convertData(data) {
  var firstName = data['Voornaam*'];
  var lastName = data['Achternaam*'];
  var email = data['Email*'];
  var education = data['Opleiding*'];
  var opleidingsInstelling = data['Opleidingsinstelling*'];
  var geslacht = data['geslacht'];
  var know = data['kennis'];
  var jeBericht = data['anders'];
  var ervaring = data['ervaring']

  // construct date format
  var date = new Date();
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();

  date = mm + '/' + dd + '/' + yyyy;
  // use insertToDB function to append the data to the database
  insertToDB(firstName, lastName, email, education, opleidingsInstelling, know, jeBericht, ervaring, date)
}

// Putting the data into the database
function insertToDB(firstName, lastName, email, education, opleidingsInstelling, know, jeBericht, ervaring, date) {
  // open database
  var db = new sqlite3.Database('admissions.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  // create table for storage
  db.run('CREATE TABLE IF NOT EXISTS test (firstName TEXT, lastName TEXT, email TEXT, education TEXT, opleidingsInstelling TEXT, know TEXT, jeBericht TEXT, ervaring TEXT, date TEXT)');

  // insert one row into the test table
  db.run(`INSERT INTO test (firstName, lastName, email, education, opleidingsInstelling, know, jeBericht, ervaring, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [firstName, lastName, email, education, opleidingsInstelling, know, jeBericht, ervaring, date], function(err) {
    if (err) {
      return console.log(err.message);
    }
  });


  // close database
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
}
