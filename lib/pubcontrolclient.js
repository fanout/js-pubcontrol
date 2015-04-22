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
var agentkeepalive = require('agentkeepalive');
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
    this.httpKeepAliveAgent = new agentkeepalive();
    this.httpsKeepAliveAgent = new agentkeepalive.HttpsAgent();
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
        this.startPubCall(this.uri, authHeader, [i], cb);
    },

    // An internal method for starting the work required for publishing
    // a message. Accepts the URI endpoint, authorization header, items
    // object, and optional callback as parameters.
    startPubCall: function(uri, authHeader, items, cb) {  // Prepare Request Body
        var content = JSON.stringify({'items': items});
        // Build HTTP headers
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(content, 'utf8')
        };
        if (authHeader != null) {
            headers['Authorization'] = authHeader;
        }
        // Build HTTP request parameters
        var publishUri = uri + '/publish/';
        var reqParams = utilities.extend(url.parse(publishUri), {
            method: 'POST',
            headers: headers
        });
        var transport;
        switch(reqParams.protocol) {
        case 'http:':
            transport = http;
            reqParams.agent = this.httpKeepAliveAgent;
            break;
        case 'https:':
            transport = https;
            reqParams.agent = this.httpsKeepAliveAgent;
            break;
        default:
            setTimeout(function() {
                utilities.applyCallback(false, cb, 'Bad URI', {
                    statusCode: -2
                });
            }, 0);
            return;
        }
        this.performHttpRequest(content, cb, transport, reqParams);
    },
    
    // An internal method for performing the HTTP request for publishing
    // a message with the specified parameters.
    performHttpRequest: function(content, cb, transport, reqParams) {
        var finishHttpRequest = this.finishHttpRequest;
        var req = transport.request(reqParams, function(res) {
            var context = {
                statusCode: res.statusCode,
                headers: res.headers,
                httpVersion: res.httpVersion
            };
            var httpData = [];
            res.setEncoding('utf8');
            res.on('data', function(data) {
                httpData.push(data);
            });
            res.on('end', function() { finishHttpRequest('end', cb,
                    httpData, context); });
            res.on('close', function() { finishHttpRequest('close', cb,
                    httpData, context); });
        });
        req.on('error', function(e) {
            utilities.applyCallback(false, cb, e.message, {
                statusCode: -1
            });
        });
        req.write(content);
        req.end();
    },

    // An internal method for finishing the HTTP request for publishing
    // a message.
    finishHttpRequest: function(mode, cb, httpData, context) {
        context.httpBody = httpData.join('');
        var success;
        var message;
        if (mode === 'end') {
            success = context.statusCode >= 200 && context.statusCode < 300;
            message = success ? '' : JSON.stringify(context.httpBody);
        } else if (mode === 'close') {
            success = false;
            message = 'Connection closed unexpectedly';
        }
        utilities.applyCallback(success, cb, message, context);
    }
});

exports.PubControlClient = PubControlClient;
