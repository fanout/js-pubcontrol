/*
 * node-pubcontrol
 * (C) 2015 Fanout, Inc.
 * File name: auth.js
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * File contains: the authorization header classes.
 * Licensed under the MIT License, see file COPYING for details.
 */

var jwt = require('jwt-simple');

var utilities = require('./utilities');

// The authorization base class for building auth headers in conjunction
// with HTTP requests used for publishing messages.
var AuthBase = utilities.defineClass({

    // This method should return the auth header in text format.
    buildHeader: function() { return null; }
});

// The basic authentication class used for building auth headers containing
// a username and password.
var AuthBasic = utilities.extendClass(AuthBase, function(user, pass) {

    // Initialize with a username and password.
    this.user = user;
    this.pass = pass;
}, {

    // Returns the auth header containing the username and password
    // in Basic auth format.
    buildHeader: function() {
        var data = this.user + ':' + this.pass;
        return 'Basic ' + new Buffer(data).toString('base64');
    }
});

// JWT authentication class used for building auth headers containing
// JSON web token information in either the form of a claim and
// corresponding key, or the literal token itself.
var AuthJwt = utilities.extendClass(AuthBase, function(claim, key) {

    // Initialize with the specified claim and key. If only one parameter
    // was provided then treat it as the literal token.
    if (arguments.length == 1) {
        this.token = claim;
        this.claim = null;
        this.key = null;
    } else {
        this.claim = claim;
        this.key = utilities.toBuffer(key);
        this.token = null;
    }
}, {

    // Returns the auth header containing the JWT token in Bearer format.
    buildHeader: function() {
        var token;
        if(this.token != null) {
            token = this.token;
        } else {
            var claim;
            if(!('exp' in this.claim)) {
                claim = utilities.extend({}, this.claim, {
                    exp: Math.floor(new Date().getTime()/1000) + 600
                });
            } else {
                claim = this.claim;
            }
            token = jwt.encode(claim, this.key);
        }
        return 'Bearer ' + token;
    }
});

exports.AuthBase = AuthBase;
exports.AuthBasic = AuthBasic;
exports.AuthJwt = AuthJwt;
