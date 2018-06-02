// FloorController

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require("jwt-simple");
const crypto = require('crypto');
const auth = require('../config/auth')();
const mkdirp = require('mkdirp');
const rssi = require('../helpers/Rssi');
const mongoose = require('mongoose');

const { jwtSecret } = require('../config/main');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const { Building } = require('../models/Building');
const { Floor } = require('../models/Floor');
const { Beacon } = require('../models/Beacon');
const { Reading } = require('../models/Reading');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// return list of floors by building
router.get('/building/:building_id', auth.authenticate(), function (req, res) {
    Floor.find({
        user_id: req.user.id,
        building_id: req.params.building_id
    }, function (err, floors) {
        if (err) {
            return res.status(500).send('Error has occured while searching for floors');
        }

        validateBuilding(req.user.id, req.params.building_id)
            .then(result => {
                return (result) ? res.status(200).send(floors) : res.status(404).send('No access');
            });
    });
});

// return single floor
router.get('/:id', auth.authenticate(), function (req, res) {
    Floor.findById(req.params.id, function (err, floor) {
        if (err || !floor || floor.user_id !== req.user.id) return res.status(500).send('Error occured or floor not found');
        return res.status(200).send(floor);
    });
});

// create new building
router.post('/', auth.authenticate(), function (req, res) {

    let somePath = '';

    Floor.create({
        title: req.body.title,
        description: req.body.description,
        building_id: req.body.building_id,
        svg_path: somePath,
        res_horizontal: req.body.res_horizontal,
        res_vertical: req.body.res_vertical,
        scale_horizontal: req.body.scale_horizontal,
        scale_vertical: req.body.scale_vertical,
        user_id: req.user.id
    }, function (err, floor) {
        if (err) return res.status(500).send('Error has occured during floor creation');

        return res.status(200).send(floor);
    });
});

// update existing floor
router.patch('/:id', auth.authenticate(), function (req, res) {
    Floor.findById(req.params.id, function (err, floor) {
        if (err || !floor || floor.user_id !== req.user.id) return res.status(500).send('Error occured or floor not found');
        
        floor.set({
            title: req.body.title,
            description: req.body.description,
            svg_path: req.body.svg_path,
            res_horizontal: req.body.res_horizontal,
            res_vertical: req.body.res_vertical,
            scale_horizontal: req.body.scale_horizontal,
            scale_vertical: req.body.scale_vertical,
        });

        floor.save(function (err, updatedFloor) {
            if (err) return res.status(500).send('Error occured during floor update');
            return res.send(updatedFloor);
        });
    });
});

// delete existing floor
router.delete('/:id', auth.authenticate(), function (req, res) {
    Floor.findById(req.params.id, function (err, floor) {
        if (err || !floor || floor.user_id !== req.user.id) return res.status(500).send('Error occured or building not found');

        floor.remove(function (err, removedFloor) {
            if (err) return res.status(500).send('Error occured during floor deletion');
            return res.send(removedFloor);
        });
    });
});

// upload map to form
router.post('/:id/upload', auth.authenticate(), function (req, res) {

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    Floor.findById(req.params.id, function (err, floor) {
        if (err || !floor || floor.user_id !== req.user.id) return res.status(500).send('Error occured or building not found');

        let file = req.files.file;
        let filePath = __basedir + '/data/uploads/' + floor._id;

        mkdirp(filePath, function (err) {
            if (err) return res.status(500).send(err);
            file.mv(filePath + '/' + file.name, function (err) {
                if (err) return res.status(500).send(err);
                floor.set({ svg_path: '/' + floor._id + '/' + file.name });
                floor.save(function (err, updatedFloor) {
                    if (err) return res.status(500).send('Error occured during floor update');
                    return res.send(updatedFloor);
                });
            });
        });

    });
});


router.get('/:id/points', auth.authenticate(), function (req, res) {
    Floor.findById(req.params.id, function (err, floor) {
        if (err || !floor || floor.user_id !== req.user.id) return res.status(500).send('Error occured or floor not found');

        // get beacons coords
        Beacon.find({ floor_id: req.params.id }, function (err, beacons) {
            if (err) return res.status(500).send('Error occured during beacon search');
            let beaconCoords = {};
            let beaconAddresses = [];
            beacons.map(function (beacon) {
                beaconAddresses.push(beacon.address);
                beaconCoords[beacon.address] = {
                    x: beacon.x,
                    y: beacon.y
                };
            });

            Reading.find({ address: { $in: beaconAddresses } }, function (req, readings) {
                if (err) return res.status(500).send('Error occured during reading search');

                let scans = rssi.sortReadingsByScanId(readings);
                let filteredScans = rssi.filterScans(scans, floor.scale_horizontal);
                let points = rssi.calculatePoints(filteredScans, beaconCoords);

                points = points.map(function (point) {
                    return {
                        x: Math.floor(point[0]),
                        y: Math.floor(point[1]),
                        value: 1
                    };
                });

                return res.status(200).send(points);
            });


        });
    });
});

function validateBuilding(user_id, building_id) {
    return Building.find({
        _id: building_id,
        user_id: user_id,
    });
}

module.exports = router;