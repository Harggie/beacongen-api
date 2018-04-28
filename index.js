const express = require('express');
const app = express();
const port = process.env.PORT || 8081;
const db = require('./config/db');
const auth = require('./config/auth')();
const cors = require('cors');

// cors
app.use(cors());

// controllers
const UserController = require('./controllers/UserController');
const BuildingController = require('./controllers/BuildingController');

app.use('/users', UserController);
app.use('/buildings', BuildingController);

// jwt auth
app.use(auth.initialize());

app.listen(port, function() {
    console.log('api listening on port ' + port);
});

