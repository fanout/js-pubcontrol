var assert = require('assert');
var utilities = require('../lib/utilities');
var pcccbHandler = require('../lib/pcccbhandler');

(function testIsFunction() {
    assert(!(utilities.isFunction('hello')));
    assert(utilities.isFunction(function(){}));
})();

(function testIsArray() {
    assert(!(utilities.isArray('hello')));
    assert(utilities.isArray([]));
})();

(function testToBuffer() {
    var buf = new Buffer('hello');
    assert.equal(buf, utilities.toBuffer(buf));
    buf = utilities.toBuffer('hello');
    assert(Buffer.isBuffer(buf));
    assert(buf.toString(), 'hello');
})();

(function testApplyCallback() {
    var wasCallbackCalled = false;
    utilities.applyCallback('status', function(status, message,
            context) {
                assert.equal(status, 'status');
                assert.equal(message, 'message');
                assert.equal(context, 'context');
                wasCallbackCalled = true;
            }, 'message', 'context');
    assert(wasCallbackCalled);
})();

(function testApplyCallbackPcccbHandler() {
    var wasCallbackCalled = false;
    utilities.applyCallback(false, new pcccbHandler.
            PubControlClientCallbackHandler(1, function(status,
                    message, context) {
                assert.equal(status, false);
                assert.equal(message, 'message');
                assert.equal(context, 'context');
                wasCallbackCalled = true;
            }), 'message', 'context');
    assert(wasCallbackCalled);
})();
