// BuildingController

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require("jwt-simple"); 
const crypto = require('crypto');
const auth = require('../config/auth')();

const { jwtSecret } = require('../config/main');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const { Building } = require('../models/Building');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// return list of buildings
router.get('/', auth.authenticate(), function (req, res) {
    Building.find({
        user_id: req.user.id
    }, function (err, buildings) {
        if (err) {
            return res.status(500).send('Error has occured while searching for buildings');
        }
        return res.status(200).send(buildings);
    })
});

// return single building
router.get('/:id', auth.authenticate(), function (req, res) {
    Building.findById(req.params.id, function (err, building) {
        if (err || !building || building.user_id !== req.user.id) return res.status(500).send('Error occured or building not found');
        return res.status(200).send(building);
      });
});

// create new building
router.post('/', auth.authenticate(), function (req, res) {

    Building.create({
        title: req.body.title,
        description: req.body.description,
        featured_image: req.body.featured_image,
        user_id: req.user.id
    }, function (err, building) {
        if (err) return res.status(500).send('Error has occured during building creation');
        
        return res.status(200).send(building);
    });
});

// update existing building
router.patch('/:id', auth.authenticate(), function(req, res) {
    Building.findById(req.params.id, function (err, building) {
        if (err || !building || building.user_id !== req.user.id) return res.status(500).send('Error occured or building not found');
        
        building.set({ 
            title: req.body.title,
            description: req.body.description,
            featured_image: req.body.featured_image
         });

        building.save(function (err, updatedBuilding) {
          if (err) return res.status(500).send('Error occured during building creation');
          return res.send(updatedBuilding);
        });
      });
});

// delete existing building
router.delete('/:id', auth.authenticate(), function(req, res) {
    Building.findById(req.params.id, function (err, building) {
        if (err || !building || building.user_id !== req.user.id) return res.status(500).send('Error occured or building not found');
        
        building.remove(function (err, removedBuilding) {
          if (err) return res.status(500).send('Error occured during building deletion');
          return res.send(removedBuilding);
        });
      });
});

module.exports = router;