#!/usr/bin/env node
var assert = require('assert');
var util = require('util');
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
    assert.notEqual(pcc.httpKeepAliveAgent, null);
    assert.notEqual(pcc.httpsKeepAliveAgent, null);
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
                Buffer.from('user:pass').toString('base64'));
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
    pcc.performHttpRequest = function(cb, transport, uri, reqParams) {
        assert.equal(reqParams.body, JSON.stringify({'items': 'items'}));
        assert.equal(typeof cb, "function")
        assert.equal(reqParams.method, 'POST');
        assert.equal(reqParams.headers['Content-Type'], 'application/json');
        assert.equal(reqParams.headers['Content-Length'],
                Buffer.byteLength(reqParams.body, 'utf8'));
        assert.equal(reqParams.headers['Authorization'], 'authHeader');
        assert.equal(uri, 'http://uri.com/publish/');
        assert.equal(pcc.httpKeepAliveAgent, reqParams.agent);
        wasPerformHttpRequestCalled = true;
    };
    pcc.startPubCall('http://uri.com', 'authHeader', 'items', function(){});
    assert(wasPerformHttpRequestCalled);
})();

(function testStartPubCallHttps() {
    var pcc = new pubControlClient.PubControlClient('https://uri.com');
    var wasPerformHttpRequestCalled = false;
    pcc.performHttpRequest = function(cb, transport, uri, reqParams) {
        assert.equal(reqParams.body, JSON.stringify({'items': 'items'}));
        assert.equal(typeof cb, "function")
        assert.equal(reqParams.method, 'POST');
        assert.equal(reqParams.headers['Content-Type'], 'application/json');
        assert.equal(reqParams.headers['Content-Length'],
                Buffer.byteLength(reqParams.body, 'utf8'));
        assert(!('Authorization' in reqParams.headers));
        assert.equal(uri, 'https://uri.com/publish/');
        assert.equal(pcc.httpsKeepAliveAgent, reqParams.agent);
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
    }, 'result', { statusCode: 300 });
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
    }, 'result', { statusCode: 300 });
    assert(wasCallbackCalled);
})();

(function testPerformHttpRequest() {
    var wasFinishHttpRequestCalled = false;
    var wasFinishHttpRequestCalledForClose = false;
    var pcc = new pubControlClient.PubControlClient('https://uri.com');

    var doFail = true;

    pcc.finishHttpRequest = function(mode, cb, httpData, context) {
        assert.equal(httpData, 'result');
        assert.equal(cb, callback);
        if (mode == 'end') {
            wasFinishHttpRequestCalled = true;
        }
        if (mode == 'close') {
            wasFinishHttpRequestCalledForClose = true;
        }
    };

    var transport = function (uri, opts) {
        return new Promise(function (resolve, reject) {
            assert.equal(opts.body, 'content');

            if (doFail) {
                reject({ message: 'message' })
            } else {
                resolve({
                    status: 200,
                    headers: {},
                    text: function () {
                        return new Promise(function (resolve) {
                            resolve('result');
                        });
                    }
                });
            }
        });
    };

    var callback = function(status, message, context) {
        if (doFail) {
            assert.equal(status, false);
            assert.equal(message, 'message');
            assert.equal(context.statusCode, -1);

            assert(!wasFinishHttpRequestCalled);
            assert(!wasFinishHttpRequestCalledForClose);

            doFail = false;

            pcc.performHttpRequest(
                callback,
                transport,
                'https://uri.com/publish/',
                {body: 'content'}
            );
        } else {
            assert(wasFinishHttpRequestCalled);
            assert(wasFinishHttpRequestCalledForClose);
        }
    }

    pcc.performHttpRequest(
        callback,
        transport,
        'https://uri.com/publish/',
        {body: 'content'}
    );
})();
