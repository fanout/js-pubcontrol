#!/usr/bin/env node
import assert from "assert";
import jwt from "jwt-simple";

import auth from '../src/utils/auth/index.mjs';

(function testAuthBase() {
    var authBase = new auth.Base();
    assert.equal(authBase.buildHeader(), null);
})();

(function testAuthBasic() {
    var authBasic = new auth.Basic("user", "pass");
    assert.equal(authBasic.user, "user");
    assert.equal(authBasic.pass, "pass");
    assert.equal(
        authBasic.buildHeader(),
        "Basic " + Buffer.from("user:pass").toString("base64")
    );
})();

(function testAuthJwt() {
    var authJwt = new auth.Jwt("claim", "key");
    assert.equal(authJwt.claim, "claim");
    assert.equal(authJwt.key, "key");
    assert(Buffer.isBuffer(authJwt.key));
    assert.equal(authJwt.token, null);
    authJwt = new auth.Jwt("token");
    assert.equal(authJwt.claim, null);
    assert.equal(authJwt.key, null);
    assert.equal(authJwt.token, "token");
    assert.equal(authJwt.buildHeader(), "Bearer token");
    authJwt = new auth.Jwt({ iss: "hello", exp: 1426106601 }, "key==");
    assert.equal(
        authJwt.buildHeader(),
        "Bearer eyJ0eXAiOiJKV1QiLCJhbG" +
        "ciOiJIUzI1NiJ9.eyJpc3MiOiJoZWxsbyIsImV4cCI6MT" +
        "QyNjEwNjYwMX0.beCyAv3kUlIYomos527H1HrzKJbgSGewQjYzoAv0XNo"
    );
    authJwt = new auth.Jwt({ iss: "hello" }, "key==");
    var claim = jwt.decode(authJwt.buildHeader().substring(7), "key==");
    assert("exp" in claim);
    assert.equal(claim["iss"], "hello");
})();
