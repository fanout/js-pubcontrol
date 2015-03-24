var assert = require('assert');
var util = require('util');
var http = require('http');
var https = require('https');
var pubControlClient = require('../lib/pubcontrolclient');
var format = require('../lib/format');
var item = require('../lib/item');
var utilities = require('../lib/utilities');

var TestFormat = function(body) { this.body = body; };
util.inherits(TestFormat, format.Format);
TestFormat.prototype.name = function() { return 'testformat'; };
TestFormat.prototype.export = function() { return {'body': this.body}; };

(function testInitialize() {
    var pcc = new pubControlClient.PubControlClient('uri');
    assert.equal(pcc.uri, 'uri');
    assert.equal(pcc.auth, null);
})();

(function testSetAuthBasic() {
    var pcc = new pubControlClient.PubControlClient('uri');
    pcc.setAuthBasic('user', 'pass');
    assert.equal(pcc.auth.user, 'user');
    assert.equal(pcc.auth.pass, 'pass');
})();

(function testSetAuthJwt() {
    var pcc = new pubControlClient.PubControlClient('uri');
    pcc.setAuthJwt('claim', 'key');
    assert.equal(pcc.auth.claim, 'claim');
    assert.equal(pcc.auth.key, 'key');
    pcc = new pubControlClient.PubControlClient('uri');
    pcc.setAuthJwt('token');
    assert.equal(pcc.auth.token, 'token');
})();

(function testPublish() {
    var wasWorkerCalled = false;
    var itm = new item.Item(new TestFormat('bodyval', 'id',
            'prev-id'));
    var exportedItem = itm.export();
    exportedItem['channel'] = 'channel';
    var pcc = new pubControlClient.PubControlClient('uri');
    pcc.startPubCall = function(uri, authHeader,
            items, cb) {
        assert.equal(uri, 'uri');
        assert.equal(authHeader, 'Basic ' +
                new Buffer('user:pass').toString('base64'));
        assert.equal(JSON.stringify(items), JSON.stringify([exportedItem]));
        assert.equal(cb, 'callback');
        wasWorkerCalled = true;
    };
    pcc.setAuthBasic('user', 'pass');
    pcc.publish('channel', itm, 'callback');
    assert(wasWorkerCalled);
})();

(function testPublishNoAuth() {
    var wasWorkerCalled = false;
    var itm = new item.Item(new TestFormat('bodyval', 'id',
            'prev-id'));
    var exportedItem = itm.export();
    exportedItem['channel'] = 'channel';
    var pcc = new pubControlClient.PubControlClient('uri');
    pcc.startPubCall = function(uri, authHeader,
            items, cb) {
        assert.equal(uri, 'uri');
        assert.equal(authHeader, null);
        assert.equal(JSON.stringify(items), JSON.stringify([exportedItem]));
        assert.equal(cb, 'callback');
        wasWorkerCalled = true;
    };
    pcc.publish('channel', itm, 'callback');
    assert(wasWorkerCalled);
})();

(function testStartPubCall() {
    var pcc = new pubControlClient.PubControlClient('http://uri.com');
    var wasPerformHttpRequestCalled = false;
    pcc.performHttpRequest = function(content, cb, transport, reqParams) {
        assert.equal(content, JSON.stringify({'items': 'items'}));
        assert(utilities.isFunction(cb));
        assert.equal(transport, http);
        assert.equal(reqParams.method, 'POST');
        assert.equal(reqParams.headers['Content-Type'], 'application/json');
        assert.equal(reqParams.headers['Content-Length'],
                Buffer.byteLength(content, 'utf8'));
        assert.equal(reqParams.headers['Authorization'], 'authHeader');
        assert.equal(reqParams.href, 'http://uri.com/publish/');
        wasPerformHttpRequestCalled = true;
    };
    pcc.startPubCall('http://uri.com', 'authHeader', 'items', function(){});
    assert(wasPerformHttpRequestCalled);
})();

(function testStartPubCallHttps() {
    var pcc = new pubControlClient.PubControlClient('https://uri.com');
    var wasPerformHttpRequestCalled = false;
    pcc.performHttpRequest = function(content, cb, transport, reqParams) {
        assert.equal(content, JSON.stringify({'items': 'items'}));
        assert(utilities.isFunction(cb));
        assert.equal(transport, https);
        assert.equal(reqParams.method, 'POST');
        assert.equal(reqParams.headers['Content-Type'], 'application/json');
        assert.equal(reqParams.headers['Content-Length'],
                Buffer.byteLength(content, 'utf8'));
        assert(!('Authorization' in reqParams.headers));
        assert.equal(reqParams.href, 'https://uri.com/publish/');
        wasPerformHttpRequestCalled = true;
    };
    pcc.startPubCall('https://uri.com', null, 'items', function() {});
    assert(wasPerformHttpRequestCalled);
})();

(function testStartPubCallBadUri() {
    var pcc = new pubControlClient.PubControlClient('https://uri.com');
    var wasCallbackCalled = false;
    pcc.startPubCall('file://uri.com', null, 'items', function(status,
            message, context) {
        assert.equal(status, false);
        assert.equal(message, 'Bad URI');
        assert.equal(context.statusCode, -2);
        wasCallbackCalled = true;
    });
    setTimeout(function() { assert(wasCallbackCalled); }, 500);
})();

(function testFinishHttpRequest() {
    var pcc = new pubControlClient.PubControlClient('https://uri.com');
    var wasCallbackCalled = false;
    pcc.finishHttpRequest('end', function(status, message, context) {
        assert.equal(status, true);
        assert.equal(message, '');
        assert.equal(context.statusCode, 200);
        wasCallbackCalled = true;
    }, ['result'], { statusCode: 200 });
    assert(wasCallbackCalled);
})();

(function testFinishHttpRequestFailure() {
    var pcc = new pubControlClient.PubControlClient('https://uri.com');
    var wasCallbackCalled = false;
    pcc.finishHttpRequest('end', function(status, message, context) {
        assert.equal(status, false);
        assert.equal(message, JSON.stringify('result'));
        assert.equal(context.statusCode, 300);
        wasCallbackCalled = true;
    }, ['result'], { statusCode: 300 });
    assert(wasCallbackCalled);
})();

(function testFinishHttpRequestClose() {
    var pcc = new pubControlClient.PubControlClient('https://uri.com');
    var wasCallbackCalled = false;
    pcc.finishHttpRequest('close', function(status, message, context) {
        assert.equal(status, false);
        assert.equal(message, 'Connection closed unexpectedly');
        assert.equal(context.statusCode, 300);
        wasCallbackCalled = true;
    }, ['result'], { statusCode: 300 });
    assert(wasCallbackCalled);
})();

(function testPerformHttpRequest() {

})();
