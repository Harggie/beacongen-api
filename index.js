const express = require('express');
const app = express();
const port = process.env.PORT || 8081;
const db = require('./config/db');
const auth = require('./config/auth')();

// controllers
const UserController = require('./controllers/UserController');
app.use('/users', UserController);


// jwt auth
app.use(auth.initialize());

app.listen(port, function() {
    console.log('api listening on port ' + port);
});

