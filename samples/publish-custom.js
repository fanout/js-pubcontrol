// publish-custom.js
// (C) 2013 Fanout, Inc.
// File authors:
// Katsuyuki Ohmuro <harmony7@pex2.jp>
// Konstantin Bokarius <kon@fanout.io>
// Licensed under the MIT License, see file COPYING for details.

// This example defines a custom format in terms of
// EPCP and sends it to a custom server.

var util = require('util');
var pubcontrol = require('pubcontrol');

// Create publisher for endpoint
var pub = new pubcontrol.PubControl({uri: "http://example.com/path/to/endpoint"});

// Define format
var MyFormat = function(data) { this.data = data; };
util.inherits(MyFormat, pubcontrol.Format);
MyFormat.prototype.name = function() { return "my-format"; };
MyFormat.prototype.export = function() { return {"data": this.data}; }

// Publish message
pub.publish("test", new pubcontrol.Item(new MyFormat("hello world")), function(success, message, context) {
    console.log(success);
    console.log(message);
    console.dir(context);
});
