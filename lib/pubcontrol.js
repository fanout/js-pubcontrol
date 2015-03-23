/*
 * nodepubcontrol
 * An EPCP library for NodeJS
 * (C) 2014 Fanout, Inc.
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * Licensed under the MIT License, see file COPYING for details.
 */

var utilities = require('./utilities');
var format = require('./format');
var item = require('./item');
var pcccbHandler = require('./pcccbhandler');
var pubControlClient = require('./pubcontrolclient');

// The PubControl class allows a consumer to manage a set of publishing
// endpoints and to publish to all of those endpoints via a single publish
// method call. A PubControl instance can be configured either using a
// hash or array of hashes containing configuration information or by
// manually adding PubControlClient instances.
var PubControl = utilities.defineClass(function(config) {

    // Initialize with or without a configuration. A configuration can be applied
    // after initialization via the apply_config method.
    if (arguments.length == 1) {
        this.applyConfig(config);
    }
    else {
        this.clients = [];
    }
}, {

    // Remove all of the configured PubControlClient instances.
    removeAllClients: function() {
        this.clients = [];
    },

    // Add the specified PubControlClient instance.
    addClient: function(client) {
        this.clients.push(client);
    },

    // Apply the specified configuration to this PubControl instance. The
    // configuration object can either be a hash or an array of hashes where
    // each hash corresponds to a single PubControlClient instance. Each hash
    // will be parsed and a PubControlClient will be created either using just
    // a URI or a URI and JWT authentication information.
    applyConfig: function(config) {
        var clients = [];
        if (typeof this.clients !== 'undefined') {
            clients = this.clients;
        }
        var config = utilities.isArray(config) ? config : [config];
        config.forEach(function(entry) {
            var client = new pubControlClient.PubControlClient(entry['uri']);
            if ('iss' in entry) {
                client.setAuthJwt({'iss': entry['iss']}, entry['key']);
            }
            clients.push(client);
        });
        this.clients = clients;
    },

    // The publish method for publishing the specified item to the specified
    // channel on the configured endpoint. The callback method is optional
    // and will be passed the publishing results after publishing is complete.
    // Note that a failure to publish in any of the configured PubControlClient
    // instances will result in a failure result being passed to the callback
    // method along with the first encountered error message.
    publish: function(channel, item, cb) {
        // TODO: Figure out how to pass the callback itself while avoiding
        // the pcccbhandler instance issue.
        var pcccbhandler = null;
        if (utilities.isFunction(cb)) {
            pcccbhandler = new pcccbHandler.
                    PubControlClientCallbackHandler(
                    this.clients.length, cb);
        }
        this.clients.forEach(function(client) {
            client.publish(channel, item, pcccbhandler);
        });
    }
});

exports.Format = format.Format;
exports.Item = item.Item;
exports.PubControlClient = pubControlClient.PubControlClient;
exports.PubControl = PubControl;
