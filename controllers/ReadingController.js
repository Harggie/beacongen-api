// ReadingController

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require("jwt-simple"); 
const crypto = require('crypto');
const auth = require('../config/auth')();
const KalmanFilter = require("kalmanjs").default;

const { jwtSecret } = require('../config/main');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const { Reading } = require('../models/Reading');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// return list of readings
router.get('/', function (req, res) {
    Reading.find({}, function (err, readings) {
        if (err) {
            return res.status(500).send('Error has occured');
        }

        // GROUPING
        let groupedData = [];
        let groupedSubArray = [];

        readings.map(function(reading, index, array) {
            let timeDiff = 0;
            
            if (index > 0) {
                timeDiff = (reading.timestamp_nanos - array[index - 1].timestamp_nanos) / 1000000000;
            }

            if (timeDiff > 15) {
                groupedData.push(groupedSubArray);
                groupedSubArray = [];
                groupedSubArray.push(reading);
                return;
            }

            groupedSubArray.push(reading);
        });

        // FILTERING
        groupedData = groupedData.map(function(group) {
            let kalmanFilter = new KalmanFilter({R: 0.01, Q: 1});

            let reducedGroup = group.map(function(reading) {
                reading.rssi = kalmanFilter.filter(reading.rssi);
                reading.distance = Math.pow(10, (-59 - reading.rssi)/(10 * 3.5));
                return reading;
            }).reduce(function(prev, current) {
                return {
                    rssi: prev.rssi + current.rssi
                };
            });

            let avgRssi = reducedGroup.rssi / group.length;

            return {
                rssi: avgRssi,
                distance: Math.pow(10, (-59 - avgRssi)/(10 * 3))
            };
        });

        return res.status(200).send(groupedData);
    })
});

function formatReading(reading, timeDiff) {
    return {
        rssi: reading.rssi,
        timeDiff: timeDiff,
    }
}

// create new reading
router.post('/', function (req, res) {
    let data = JSON.parse(req.body.data);
    Reading.collection.insert(data, function (err, building) {
        if (err) return res.status(500).send('Error has occured during building creation');
        return res.status(200).send(building);
    });
});

module.exports = router;