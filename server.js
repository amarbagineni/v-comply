const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./api/v1/router');

const app = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomain);

// mount api v1 routes
app.use('/api/v1', routes);
app.use('/*', (req, res) => res.send('Not Found'));

app.use(express.static('public'))

app.listen(3002, () => {
    console.log('Listenting on the port 3002');
});
