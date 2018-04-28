// UserController

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require("jwt-simple"); 
const crypto = require('crypto');
const auth = require('../config/auth')();

const { jwtSecret } = require('../config/main');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const { User } = require('../models/User');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// return list of users
router.get('/', auth.authenticate(), function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            return res.status(500).send('Error has occured');
        }
        return res.status(200).send(users);
    })
});

// create new user
router.post('/', [
    check('username').isLength({ min: 5 }).withMessage('must have atleast 5 characters'),
    check('email').isEmail().withMessage('must be an email').trim().normalizeEmail()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: crypto.createHash('sha256').update(req.body.password).digest('hex')
    }, function (err, user) {
        if (err) return res.status(500).send('Error has occured during user creation');
        let userData = matchedData(req);
        return res.status(200).send(userData);
    });
});

// user login
router.post("/login", [
    check('username').exists(),
    check('password').exists()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    var username = req.body.username;
    var password = crypto.createHash('sha256').update(req.body.password).digest('hex');

    User.findOne({
        'username': username,
        'password': password
    }, function (err, user) {
        if (err || !user){
            res.statusMessage = 'User not found';
            return res.status(401).end();
        }

        var payload = {
            id: user.id
        };
    
        var token = jwt.encode(payload, jwtSecret);
        res.json({
            username: user.username,
            token: token
        });
    });
});


module.exports = router;