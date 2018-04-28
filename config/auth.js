// auth.js
const passport = require("passport");  
const { ExtractJwt, Strategy } = require("passport-jwt");
const { jwtSession, jwtSecret } = require("./main"); 
const { User } = require('../models/User');

const params = {  
    secretOrKey: jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};


module.exports = function() {  
    var strategy = new Strategy(params, function(payload, done) {
        User.findOne({
            '_id': payload.id,
        }, function (err, user) {
            if (err) return done(new Error("User not found"), null);
            return done(null, {
                id: user.id
            });
        });
    });
    passport.use(strategy);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", jwtSession);
        }
    };
};