var assert = require('assert');
var pcccbHandler = require('../lib/pcccbhandler');

(function testInitialize() {
    var pcccbh = new pcccbHandler.PubControlClientCallbackHandler(1, 'callback');
    assert.equal(pcccbh.numCalls, 1);
    assert.equal(pcccbh.callback, 'callback');
    assert.equal(pcccbh.success, true);
    assert.equal(pcccbh.firstErrorMessage, null);
    assert.equal(pcccbh.firstErrorContext, null);
})();

(function testIsPubControlClientCallbackHandler() {
    var pcccbh = new pcccbHandler.PubControlClientCallbackHandler(1, 'callback');
    assert.equal(pcccbh.isPubControlClientCallbackHandler(), true);
})();

(function testOneCallSuccess() {
    var wasCallbackCalled = false;
    var pcccbh = new pcccbHandler.PubControlClientCallbackHandler(1,
            function(result, error, context) {
                assert(result);
                assert.equal(error, null);
                assert.equal(context, null);
                wasCallbackCalled = true;
            });
    pcccbh.pubControlClientCallbackHandler(true);
    assert(wasCallbackCalled);
})();

(function testThreeCallSuccess() {
    var wasCallbackCalled = false;
    var pcccbh = new pcccbHandler.PubControlClientCallbackHandler(3,
            function(result, error, context) {
                assert(result);
                assert.equal(error, null);
                assert.equal(context, null);
                wasCallbackCalled = true;
            });
    pcccbh.pubControlClientCallbackHandler(true);
    assert(!wasCallbackCalled);
    pcccbh.pubControlClientCallbackHandler(true);
    assert(!wasCallbackCalled);
    pcccbh.pubControlClientCallbackHandler(true);
    assert(wasCallbackCalled);
})();

(function testOneCallFailure() {
    var wasCallbackCalled = false;
    var pcccbh = new pcccbHandler.PubControlClientCallbackHandler(1,
            function(result, error, context) {
                assert(!result);
                assert.equal(error, 'error');
                assert.equal(context, 'context');
                wasCallbackCalled = true;
            });
    pcccbh.pubControlClientCallbackHandler(false, 'error', 'context');
    assert(wasCallbackCalled);
})();

(function testThreeCallFailure() {
    var wasCallbackCalled = false;
    var pcccbh = new pcccbHandler.PubControlClientCallbackHandler(3,
            function(result, error, context) {
                assert(!result);
                assert.equal(error, 'error');
                assert.equal(context, 'context');
                wasCallbackCalled = true;
            });
    pcccbh.pubControlClientCallbackHandler(false, 'error', 'context');
    assert(!wasCallbackCalled);
    pcccbh.pubControlClientCallbackHandler(true);
    assert(!wasCallbackCalled);
    pcccbh.pubControlClientCallbackHandler(false, 'error2', 'context2');
    assert(wasCallbackCalled);
})();
