// Place your server entry point code here
const http = require('http');
const fs = require('fs');
const morgan = require('morgan');
const db = require('./src/services/database.js');

const args = require('minimist')(process.argv.slice(2))
args["port"]
const port = args.port || process.env.PORT || 5000;

const express = require('express');
const app = express();
// Serve static HTML files      <- added ontop of a4 code
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


if (args.log == 'false') {
    console.log("access.log not created");
} else {
    const LogAccess = fs.createWriteStream('access.log', { flags: 'a' });
    app.use(morgan('combined', { stream: LogAccess }));
}


const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help, -h	Return this message and exit.
`);

// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help);
    process.exit(0);
}


//Coin Functions because importing them wouldnt work 
function coinFlip() {
    let flipped = Math.floor(Math.random() * 2)
    if (flipped == 0) {
      return "heads";
    } else {
      return "tails";
    }
  }
    
  function coinFlips(flips) {
    let results = [flips];
    for (let i = 0; i < flips; i++) {
      results[i] = coinFlip();
    }
    return results;
  }
    
  function countFlips(array) {
    let headcount = 0;
    let tailscount = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "heads") {
        headcount++;
      } else {
        tailscount++;
      }
    }
    return {"heads": headcount, "tails": tailscount};
  }
    
  function flipACoin(call) {
    var flip = coinFlip()
    if (call == flip) {
      var result = "win"
    } else {
      var result = "lose"
    }
    return {"call": call, "flip": flip, "result": result};
  }

app.use( (req, res, next) => {
    let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
    }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next()
  })

  
if (args.debug) {
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all()
            res.status(200).json(stmt)
        } catch {
            console.error('Error')
    }})
    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.');
    })
}


//API endpoints
app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.end(res.statusCode + "OK");
});
  
app.get('/app/flips/:number', (req, res) => {
  const flips = coinFlips(req.params.number)
  res.status(200).json({"raw" : flips, "summary" : countFlips(flips)})
});

//post api endpoints
app.post('/app/flip/', (req,res) => {
    res.status(200).json({'flip':coinFlip()})
})

app.post('/app/flip/coins/', (req,res) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw": flips, "summary":count})
})

app.post('/app/flip/call/', (req,res) => {
    const flipy = flipACoin(req.body.guess)
    res.status(200).json(flipy)
})

app.use(function(req, res){
  res.status(404).send("404 NOT FOUND")
});

const server = app.listen(port, () => {
  console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

//server is stopped
process.on('SIGTERM', () => {
  server.close(() => {
      console.log('Server stopped')
  })
})
  

