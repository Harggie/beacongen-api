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

        let scans = sortReadingsByScanId(readings);

        // FILTERING
        // groupedData = groupedData.map(function(group) {
        //     let kalmanFilter = new KalmanFilter({R: 0.01, Q: 1});

        //     let reducedGroup = group.map(function(reading) {
        //         reading.rssi = kalmanFilter.filter(reading.rssi);
        //         reading.distance = Math.pow(10, (-59 - reading.rssi)/(10 * 3.5));
        //         return reading;
        //     }).reduce(function(prev, current) {
        //         return {
        //             rssi: prev.rssi + current.rssi
        //         };
        //     });

        //     let avgRssi = reducedGroup.rssi / group.length;

        //     return {
        //         rssi: avgRssi,
        //         distance: Math.pow(10, (-59 - avgRssi)/(10 * 3))
        //     };
        // });

        return res.status(200).send(scans);
    })
});

// function sortReadingsByAddress(scans) {
//     scans.map(function(scan, index, array) {
//         let devices = {};
//         scan.map(function(reading, index, array) {
//             if (data[reading.scan_id] === undefined) {
//                 data[reading.scan_id] = [reading];
//             } else {
//                 data[reading.scan_id].push(reading);    
//             } 
//         })
//     });
// }

function sortReadingsByScanId(readings) {
    let data = {};
    readings.map(function (reading, index, array) {
        if (data[reading.scan_id] === undefined) {
            data[reading.scan_id] = {};
            data[reading.scan_id][reading.address] = [reading];
            return;
        }

        if (data[reading.scan_id][reading.address] === undefined) {
            data[reading.scan_id][reading.address] = [reading];
            return;
        }

        data[reading.scan_id][reading.address].push(reading);
    });

    let scanData = [];
    for (let scan in data) {
        scanData.push(data[scan]);
    }

    return scanData;
}

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