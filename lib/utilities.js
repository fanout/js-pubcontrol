/*
 * node-pubcontrol
 * (C) 2015 Fanout, Inc.
 * File name: utilities.js
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * File contains: various helper methods.
 * Licensed under the MIT License, see file COPYING for details.
 */

var objectToString = Object.prototype.toString;

// Class creation and management methods.
var extend = function() {
  var args = Array.prototype.slice.call(arguments);

  var obj;
  if (args.length > 1) {
    obj = args.shift();
  } else {
    obj = {};
  }

  while (args.length > 0) {
    var opts = args.shift();
    if (opts != null) {
      for (prop in opts) {
        obj[prop] = opts[prop];
      }
    }
  }

  return obj;
};

// Method used for executing a callback method for the specified
// callback object, status, message, and context. The way the
// callback is executed depends on whether the callback object
// is a function or an instance of PubControlClientCallbackHandler.
var applyCallback = function(status, cb, message, context) {
  if (cb && cb.isPubControlClientCallbackHandler) {
    cb.pubControlClientCallbackHandler(status, message, context);
  } else if (typeof cb === "function") {
    cb(status, message, context);
  }
};

exports.applyCallback = applyCallback;
exports.objectToString = objectToString;
exports.extend = extend;
