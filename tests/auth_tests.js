var assert = require('assert');
var jwt = require('jwt-simple');
var auth = require('../lib/auth');

(function testAuthBase() {
    var authBase = new auth.AuthBase();
    assert.equal(authBase.buildHeader(), null);
})();

(function testAuthBasic() {
    var authBasic = new auth.AuthBasic('user', 'pass');
    assert.equal(authBasic.user, 'user');
    assert.equal(authBasic.pass, 'pass');
    assert.equal(authBasic.buildHeader(), 'Basic ' +
            new Buffer('user:pass').toString('base64'));
})();

(function testAuthJwt() {
    var authJwt = new auth.AuthJwt('claim', 'key');
    assert.equal(authJwt.claim, 'claim');
    assert.equal(authJwt.key, 'key');
    assert(Buffer.isBuffer(authJwt.key));
    assert.equal(authJwt.token, null);
    authJwt = new auth.AuthJwt('token');
    assert.equal(authJwt.claim, null);
    assert.equal(authJwt.key, null);
    assert.equal(authJwt.token, 'token');
    assert.equal(authJwt.buildHeader(), 'Bearer token');
    authJwt = new auth.AuthJwt({'iss': 'hello', 'exp': 1426106601},
            'key==');
    assert.equal(authJwt.buildHeader(), 'Bearer eyJ0eXAiOiJKV1QiLCJhbG' +
            'ciOiJIUzI1NiJ9.eyJpc3MiOiJoZWxsbyIsImV4cCI6MT' +
            'QyNjEwNjYwMX0.beCyAv3kUlIYomos527H1HrzKJbgSGewQjYzoAv0XNo');
    authJwt = new auth.AuthJwt({'iss': 'hello'},
            'key==');
    var claim = jwt.decode(authJwt.buildHeader().substring(7), 'key==');
    assert('exp' in claim);
    assert.equal(claim['iss'], 'hello');
})();
