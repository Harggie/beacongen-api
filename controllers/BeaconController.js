// BeaconController

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require("jwt-simple");
const crypto = require('crypto');
const auth = require('../config/auth')();

const { jwtSecret } = require('../config/main');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const { Beacon } = require('../models/Beacon');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// return list of beacons
router.get('/:floor_id', function (req, res) {
    Beacon.find({
        floor_id: req.params.floor_id
    }, function (err, beacons) {
        if (err) {
            return res.status(500).send('Error has occured');
        }

        return res.status(200).send(beacons);
    })
});

// create new beacon
router.post('/', function (req, res) {
    Beacon.create({
        x: req.body.x,
        y: req.body.y,
        address: req.body.address,
        floor_id: req.body.floor_id
    }, function (err, beacon) {
        if (err) return res.status(500).send('Error has occured during beacon creation');
        return res.status(200).send(beacon);
    });
});

module.exports = router;