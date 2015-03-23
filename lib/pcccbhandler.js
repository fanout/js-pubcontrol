/*
 * node-pubcontrol
 * (C) 2015 Fanout, Inc.
 * File name: pcccbhandler.js
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * File contains: the PubControlClientCallbackHandler class.
 * Licensed under the MIT License, see file COPYING for details.
 */

var utilities = require('./utilities');

// The PubControlClientCallbackHandler class is used internally for allowing
// an publish call made from the PubControl class to execute a callback
// method only a single time. A PubControl instance can potentially contain
// many PubControlClient instances in which case this class tracks the number
// of successful publishes relative to the total number of PubControlClient
// instances. A failure to publish in any of the PubControlClient instances
// will result in a failed result passed to the callback method and the error
// from the first encountered failure.
var PubControlClientCallbackHandler = utilities.defineClass(
        function(numCalls, callback) {

    // The initialize method accepts: a num_calls parameter which is an integer
    // representing the number of PubControlClient instances, and a callback
    // method to be executed after all publishing is complete.
    this.numCalls = numCalls;
    this.callback = callback;
    this.success = true;
    this.firstErrorMessage = null;
    this.firstErrorContext = null;
}, {

    // Helper method for determining whether the object is an instance
    // of PubControlClientCallbackHandler.
    isPubControlClientCallbackHandler: function() {
        return true;
    },

    // The handler method which is executed by PubControlClient when publishing
    // is complete. This method tracks the number of publishes performed and 
    // when all publishes are complete it will call the callback method
    // originally specified by the consumer. If publishing failures are
    // encountered only the first error is saved and reported to the callback
    // method.
    pubControlClientCallbackHandler: function(success, message, context) {
        if (!success && this.success) {
            this.success = false;
            this.firstErrorMessage = message;
            this.firstErrorContext = context;
        }
        this.numCalls -= 1;
        if (this.numCalls <= 0) {
            utilities.applyCallback(this.success, this.callback,
                    this.firstErrorMessage, this.firstErrorContext);
        }
    }
});

exports.PubControlClientCallbackHandler = PubControlClientCallbackHandler;
