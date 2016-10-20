var express = require('express');
var logger = require('morgan'); //remove on final
var bodyParser = require('body-parser');
var USER = require('./model/userSchema');
var config = require('./API/config');
var mongoose = require('mongoose');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var Strategy = require('passport-local');

var authenticate = expressJwt({
    secret: config.SECRET
});

mongoose.connect('mongodb://localhost/passport', function(err) {
    if (err) throw err;
    else console.log('Mongo db connnected');
});

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept ,Authorization");
    next();
});

passport.use(new Strategy(
    function(username, password, done) {
        authenticateCredentials(username, password, done);
    }
));

function authenticateCredentials(usr, psw, cb) {
    USER.findOne({
        email: usr,
        password: psw
    }, function(err, usr) {
        if (err) {
            cb(null, false);
            return;
        } else if (!usr) {
            cb(null, false);
            return;
        } else {
            cb(null, {
                id: usr._id,
                firstname: usr.firstname,
                lastname: usr.lastname,
                email: usr.email,
                verified: true
            });
            return;
        }
    })
}


var FacebookTokenStrategy = require('passport-facebook-token');

passport.use(new FacebookTokenStrategy({
    clientID: config.FACEBOOK_APP_ID,
    clientSecret: config.FACEBOOK_APP_SECRET
}, function(accessToken, refreshToken, profile, done) {
    USER.findOne({
        facebookID: profile.id
    }, function(err, usr) {
        if (err) {
            done(null, false);
            return;
        } else if (!usr) {
            done(null, false);
            return;
        } else {
            done(null, {
                id: usr._id,
                firstname: usr.firstname,
                lastname: usr.lastname,
                email: usr.email,
                verified: true
            });
            return;
        }
    })
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});



app.use(logger('dev')); //remove on final
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(passport.initialize());

require('./routes/api')(app, passport, Strategy, authenticate);

app.listen(config.PORT);

module.exports = app;