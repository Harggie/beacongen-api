// db.js

const mongoose = require('mongoose');
const dbUrl = 'mongodb://mongodb:27017/beacongen_db';

function reconnect(){
    return mongoose.connect(dbUrl, function(err) {
        if (err) {
            console.log('failed to connect to db, reconnecting in 5s');
            setTimeout(reconnect, 5000);
        }
    });
}

reconnect();
