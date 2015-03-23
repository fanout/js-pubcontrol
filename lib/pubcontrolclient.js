/*
 * node-pubcontrol
 * (C) 2015 Fanout, Inc.
 * File name: pubcontrolclient.js
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * File contains: the PubControlClient class.
 * Licensed under the MIT License, see file COPYING for details.
 */

var http = require('http');
var https = require('https');
var url = require('url');

var utilities = require('./utilities');
var auth = require('./auth');

// The PubControlClient class allows consumers to publish to an endpoint of
// their choice. The consumer wraps a Format class instance in an Item class
// instance and passes that to the publish method. The publish method has
// an optional callback parameter that is called after the publishing is 
// complete to notify the consumer of the result.
var PubControlClient = utilities.defineClass(function(uri) {

    // Initialize this class with a URL representing the publishing endpoint.
    this.uri = uri;
    this.auth = null;
}, {

    // Call this method and pass a username and password to use basic
    // authentication with the configured endpoint.
    setAuthBasic: function(username, password) {
        this.auth = new auth.AuthBasic(username, password);
    },

    // Call this method and pass a claim and key to use JWT authentication
    // with the configured endpoint.
    setAuthJwt: function(claim, key) {
        if (key) {
            this.auth = new auth.AuthJwt(claim, key);
        }
        else {
            this.auth = new auth.AuthJwt(claim);
        }
    },

    // The publish method for publishing the specified item to the specified
    // channel on the configured endpoint. The callback method is optional
    // and will be passed the publishing results after publishing is complete.
    publish: function(channel, item, cb) {
        var i = item.export();
        i['channel'] = channel;
        var authHeader = this.auth != null ? this.auth.buildHeader() : null;
        publishCallWorker(this.uri, authHeader, [i], cb);
    }
});

// An internal method used for doing the work required for publishing
// a message. Accept the URI endpoint, authorization header, items
// object, and optional callback as parameters.
var publishCallWorker = function(uri, authHeader, items, cb) {
    // Prepare Request Body
    var content = JSON.stringify({'items': items});
    // Build HTTP Headers
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8')
    };
    if (authHeader != null) {
        headers['Authorization'] = authHeader;
    }
    // Build HTTP Request Parameters
    var publishUri = uri + '/publish/';
    var reqParams = utilities.extend(url.parse(publishUri), {
        method: 'POST',
        headers: headers
    });
    var transport;
    switch(reqParams.protocol) {
    case 'http:':
        transport = http;
        break;
    case 'https:':
        transport = https;
        break;
    default:
        setTimeout(function() {
            utilities.applyCallback(false, cb, 'Bad URI', {
                statusCode: -2
            });
        }, 0);
        return;
    }
    // Perform HTTP Request
    var req = transport.request(reqParams, function(res) {
        var context = {
            statusCode: res.statusCode,
            headers: res.headers,
            httpVersion: res.httpVersion
        };
        var httpData = [];
        var finishRequest = function(mode) {
            context.httpBody = httpData.join('');
            var success;
            var message;
            if(mode === 'end') {
                success = context.statusCode >= 200 && context.statusCode < 300;
                message = success ? '' : JSON.stringify(context.httpBody);
            } else if (mode === 'close') {
                success = false;
                message = 'Connection closed unexpectedly';
            }
            utilities.applyCallback(success, cb, message, context);
        };
        res.setEncoding('utf8');
        res.on('data', function(data) {
            httpData.push(data);
        });
        res.on('end', function() { finishRequest('end'); });
        res.on('close', function() { finishRequest('close'); });
    });
    req.on('error', function(e) {
        utilities.applyCallback(false, cb, e.message, {
            statusCode: -1
        });
    });
    req.write(content);
    req.end();
};

exports.PubControlClient = PubControlClient;
