global.__basedir = __dirname;

const express = require('express');
const app = express();
const port = process.env.PORT || 8081;
const db = require('./config/db');
const auth = require('./config/auth')();
const cors = require('cors');
const fileUpload = require('express-fileupload');


// multipart data forms
app.use(fileUpload());

// cors
app.use(cors());

// serve static files
app.use(express.static(__dirname + '/data/uploads'));

// controllers
const UserController = require('./controllers/UserController');
const BuildingController = require('./controllers/BuildingController');
const FloorController = require('./controllers/FloorController');
const ReadingController = require('./controllers/ReadingController');
const BeaconController = require('./controllers/BeaconController');

app.use('/users', UserController);
app.use('/buildings', BuildingController);
app.use('/floors', FloorController);
app.use('/readings', ReadingController);
app.use('/beacons', BeaconController);

// jwt auth
app.use(auth.initialize());

app.listen(port, function() {
    console.log('api listening on port ' + port);
});

