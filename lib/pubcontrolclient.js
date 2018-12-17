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

var fetch =
  global.fetch !== undefined ? global.fetch : require("node-fetch").default;
var agentkeepalive = require("agentkeepalive");
var url = require("url");

var utilities = require("./utilities");
var auth = require("./auth");

// The PubControlClient class allows consumers to publish to an endpoint of
// their choice. The consumer wraps a Format class instance in an Item class
// instance and passes that to the publish method. The publish method has
// an optional callback parameter that is called after the publishing is
// complete to notify the consumer of the result.
var PubControlClient = utilities.defineClass(
  function(uri) {
    // Initialize this class with a URL representing the publishing endpoint.
    this.uri = uri.replace(/\/$/, "");
    this.auth = null;
    this.httpKeepAliveAgent = new agentkeepalive();
    this.httpsKeepAliveAgent = new agentkeepalive.HttpsAgent();
  },
  {
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
      } else {
        this.auth = new auth.AuthJwt(claim);
      }
    },

    // The publish method for publishing the specified item to the specified
    // channel on the configured endpoint. The callback method is optional
    // and will be passed the publishing results after publishing is complete.
    publish: function(channel, item, cb) {
      var i = item.export();
      i["channel"] = channel;
      var authHeader = this.auth != null ? this.auth.buildHeader() : null;
      this.startPubCall(this.uri, authHeader, [i], cb);
    },

    // An internal method for starting the work required for publishing
    // a message. Accepts the URI endpoint, authorization header, items
    // object, and optional callback as parameters.
    startPubCall: function(uri, authHeader, items, cb) {
      // Prepare Request Body
      var content = JSON.stringify({ items: items });
      // Build HTTP headers
      var headers = {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(content, "utf8")
      };
      if (authHeader != null) {
        headers["Authorization"] = authHeader;
      }
      // Build HTTP request parameters
      var publishUri = uri + "/publish/";
      var parsed = url.parse(publishUri);
      var reqParams = {
        method: "POST",
        headers: headers,
        body: content
      };
      switch (parsed.protocol) {
        case "http:":
          reqParams.agent = this.httpKeepAliveAgent;
          break;
        case "https:":
          reqParams.agent = this.httpsKeepAliveAgent;
          break;
        default:
          setTimeout(function() {
            utilities.applyCallback(false, cb, "Bad URI", {
              statusCode: -2
            });
          }, 0);
          return;
      }
      this.performHttpRequest(cb, fetch, publishUri, reqParams);
    },

    // An internal method for performing the HTTP request for publishing
    // a message with the specified parameters.
    performHttpRequest: function(cb, transport, uri, reqParams) {
      var finishHttpRequest = this.finishHttpRequest;
      transport(uri, reqParams).then(
        function(res) {
          var context = {
            statusCode: res.status,
            headers: res.headers
          };
          res.text().then(
            function(data) {
              finishHttpRequest("end", cb, data, context);
            },
            function(err) {
              finishHttpRequest("close", cb, err, context);
            }
          );
        },
        function(err) {
          utilities.applyCallback(false, cb, err.message, {
            statusCode: -1
          });
        }
      );
    },

    // An internal method for finishing the HTTP request for publishing
    // a message.
    finishHttpRequest: function(mode, cb, httpData, context) {
      context.httpBody = httpData;
      var success;
      var message;
      if (mode === "end") {
        success = context.statusCode >= 200 && context.statusCode < 300;
        message = success ? "" : JSON.stringify(context.httpBody);
      } else if (mode === "close") {
        success = false;
        message = "Connection closed unexpectedly";
      }
      utilities.applyCallback(success, cb, message, context);
    }
  }
);

exports.PubControlClient = PubControlClient;
