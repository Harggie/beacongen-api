// ReadingController

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require("jwt-simple");
const crypto = require('crypto');
const auth = require('../config/auth')();
const rssi = require('../helpers/Rssi');

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

        let beaconCoords = {
            "6A:C2:D2:F2:09:09": {
                x: 0,
                y: 0
            },
            "6A:C2:D2:F2:09:10": {
                x: 10,
                y: 0
            },
            "6A:C2:D2:F2:09:11": {
                x: 5,
                y: 5
            },
        }

        let scans = rssi.sortReadingsByScanId(readings);
        let filteredScans = rssi.filterScans(scans);
        let points = rssi.calculatePoints(filteredScans, beaconCoords);

        points = points.map(function(point) {
            return {
                x: point[0],
                y: point[1],
                value: 1
            };
        });

        return res.status(200).send(points);
    });
});

// create new reading
router.post('/', function (req, res) {
    let data = JSON.parse(req.body.data);
    Reading.collection.insert(data, function (err, building) {
        if (err) return res.status(500).send('Error has occured during building creation');
        return res.status(200).send(building);
    });
});

module.exports = router;