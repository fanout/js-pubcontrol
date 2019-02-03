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

var jwt = require("jwt-simple");

var utilities = require("./utilities");

// The authorization base class for building auth headers in conjunction
// with HTTP requests used for publishing messages.
class AuthBase {
  // This method should return the auth header in text format.
  buildHeader() {
    return null;
  }
}

class AuthBasic extends AuthBase {
  constructor(user, pass) {
    super();
    // Initialize with a username and password.
    this.user = user;
    this.pass = pass;
  }
  // Returns the auth header containing the username and password
  // in Basic auth format.
  buildHeader() {
    var data = this.user + ":" + this.pass;
    return "Basic " + new Buffer(data).toString("base64");
  }
}

// JWT authentication class used for building auth headers containing
// JSON web token information in either the form of a claim and
// corresponding key, or the literal token itself.
class AuthJwt extends AuthBase {
  constructor(claim, key) {
    super();
    // Initialize with the specified claim and key. If only one parameter
    // was provided then treat it as the literal token.
    if (arguments.length == 1) {
      this.token = claim;
      this.claim = null;
      this.key = null;
    } else {
      this.claim = claim;
      this.key = key instanceof Buffer ? key : Buffer.from(String(key), "utf8");
      this.token = null;
    }
  }
  // Returns the auth header containing the JWT token in Bearer format.
  buildHeader() {
    var token;
    if (this.token != null) {
      token = this.token;
    } else {
      const claim =
        "exp" in this.claim
          ? this.claim
          : Object.assign({}, this.claim, {
              exp: Math.floor(new Date().getTime() / 1000) + 600
            });
      token = jwt.encode(claim, this.key);
    }
    return "Bearer " + token;
  }
}

exports.AuthBase = AuthBase;
exports.AuthBasic = AuthBasic;
exports.AuthJwt = AuthJwt;
