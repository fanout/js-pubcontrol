#!/usr/bin/env node
var assert = require("assert");
var utilities = require("../lib/utilities");
var pcccbHandler = require("../lib/pcccbhandler");

(function testApplyCallback() {
  var wasCallbackCalled = false;
  utilities.applyCallback(
    "status",
    function(status, message, context) {
      assert.equal(status, "status");
      assert.equal(message, "message");
      assert.equal(context, "context");
      wasCallbackCalled = true;
    },
    "message",
    "context"
  );
  assert(wasCallbackCalled);
})();

(function testApplyCallbackPcccbHandler() {
  var wasCallbackCalled = false;
  utilities.applyCallback(
    false,
    new pcccbHandler.PubControlClientCallbackHandler(1, function(
      status,
      message,
      context
    ) {
      assert.equal(status, false);
      assert.equal(message, "message");
      assert.equal(context, "context");
      wasCallbackCalled = true;
    }),
    "message",
    "context"
  );
  assert(wasCallbackCalled);
})();
