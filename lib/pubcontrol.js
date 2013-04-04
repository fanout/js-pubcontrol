/*
 * nodepubcontrol
 * An EPCP library for NodeJS
 * (C) 2013 Fan Out Networks, Inc.
 * File author: Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Licensed under the MIT License, see file COPYING for details.
 */

// Version String
var version = "0.1.0";

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var jwt = require('jwt-simple');

////////////////////////////////////////
// General Utilities

// Type Detection
var objectToString = Object.prototype.toString;
var functionObjectIdentifier = objectToString.call(function(){});
var isFunction = function(obj) {
    return obj && objectToString.call(obj) === functionObjectIdentifier;
};
var arrayObjectIdentifier = objectToString.call([]);
var isArray = function(obj) {
    return obj && objectToString.call(obj) === arrayObjectIdentifier;
};

// Objects
var extend = function() {
    var args = Array.prototype.slice.call(arguments);

    var obj;
    if (args.length > 1) {
        obj = args.shift();
    } else {
        obj = {};
    }

    while(args.length > 0) {
        var opts = args.shift();
        if(opts != null) {
            for(prop in opts) {
                obj[prop] = opts[prop];
            }
        }
    }

    return obj;
};

var extendClass = function(prototype) {
    var constructor, properties;
    var argc = arguments.length;
    if (argc >= 3) {
        constructor = arguments[1];
        properties = arguments[2];
    } else if (argc == 2) {
        var arg = arguments[1];
        if(isFunction(arg)) {
            constructor = arg;
            properties = null;
        } else {
            constructor = function(){};
            properties = arg;
        }
    } else if (argc == 1) {
        constructor = function(){};
        properties = null;
    }

    if (isFunction(prototype)) {
        prototype = new prototype();
    }

    if(prototype) {
        constructor.prototype = prototype;
    }
    if(properties) {
        extend(constructor.prototype, properties);
    }
    return constructor;
};

var defineClass = function() {
    var args = [null].concat(Array.prototype.slice.call(arguments));
    return extendClass.apply(this, args);
};

////////////////////////////////////////
// Classes

// Format (abstract)
var Format = defineClass({
    name: function() { return null; },
    export: function() { return null; }
});

// Item
var Item = defineClass(function(formats, id, prevId) {
    var formats = isArray(formats) ? formats : [formats];
    this.formats = formats;
    if (arguments.length >= 3) {
        this.prevId = prevId;
    }
    if (arguments.length >= 2) {
        this.id = id;
    }
}, {
    export: function() {
        var obj = {};
        if("id" in this) {
            obj["id"] = this.id;
        }
        if("prevId" in this) {
            obj["prev-id"] = this.prevId;
        }
        this.formats.forEach(function(format) {
            obj[format.name()] = format.export();
        });
        return obj;
    }
});

// PubControl publisher class
var PubControl = defineClass(function(uri, auth) {
    this.uri = uri;
    this.auth = auth;
}, {
    // URI Getter
    getUri: function() {
        return this.uri;
    },
    // URI Setter
    setUri: function(uri) {
        this.uri = uri;
    },
    // Auth Getter
    getAuth: function() {
        return this.auth;
    },
    // Auth Setter
    setAuth: function(auth) {
        this.auth = auth;
    },
    // Publish Method
    publish: function(channel, item, cb) {
        var i = item.export();
        i["channel"] = channel;
        var authHeader = this.auth != null ? this.auth.buildHeader() : null;
        publishCallWorker(this.uri, authHeader, [i], cb);
    }
});

// Publish Call Worker
var publishCallWorker = function(uri, authHeader, items, cb) {

    // Prepare Request Body
    var content = JSON.stringify({"items": items});

    // Build HTTP Headers
    var headers = {
        "Content-Type": "application/json",
        "Content-Length": content.length
    };
    if (authHeader != null) {
        headers["Authorization"] = authHeader;
    }

    // Build HTTP Request Parameters
    var publishUri = uri + "/publish/";
    var reqParams = extend(url.parse(publishUri), {
        method: 'POST',
        headers: headers
    });

    var transport;
    switch(reqParams.protocol) {
    case "http:":
        transport = http;
        break;
    case "https:":
        transport = https;
        break;
    default:
        setTimeout(function() {
            applyCallback(false, cb, {
                statusCode: -2,
                message: "Bad URI"
            });
        }, 0);
        return;
    }

    // Perform HTTP Request
    var req = transport.request(reqParams, function(res) {
        var message = {
            statusCode: res.statusCode,
            headers: res.headers,
            httpVersion: res.httpVersion,
            data: []
        };
        res.setEncoding('utf8');
        res.on('data', function(data) {
            message.data.push(data);
        })
        res.on('end', function() {
            applyCallback(true, cb, message);
        });
        res.on('close', function() {
            applyCallback(false, cb, message);
        });
    });
    req.on('error', function(e) {
        applyCallback(false, cb, {
            statusCode: -1,
            message: e.message
        });
    });
    req.write(content);
    req.end();
};

// Apply callback method
var applyCallback = function(status, cb, message) {
    if(isFunction(cb)) {
        cb(status, message);
    }
};

// Authentication classes
// Auth base class
var AuthBase = defineClass({
    buildHeader: function() { return null; }
});
// Basic Authentication
var AuthBasic = extendClass(AuthBase, function(user, pass) {
    this.user = user;
    this.pass = pass;
}, {
    buildHeader: function() {
        var data = this.user + ":" + this.pass;
        return "Basic " + new Buffer(data).toString('base64');
    }
});
// Json Web Token
var AuthJwt = extendClass(AuthBase, function(claim, key) {
    // If only one parameter, treat it as the literal token
    if (arguments.length == 1) {
        this.token = claim;
        this.claim = null;
        this.key = null;
    } else {
        this.claim = claim;
        this.key = key;
        this.token = null;
    }
}, {
    buildHeader: function() {
        var token;
        if(this.token != null) {
            token = this.token;
        } else {
            var claim;
            if(!("exp" in this.claim)) {
                claim = extend({}, this.claim, {
                    exp: Math.floor(new Date().getTime()/1000) + 600
                });
            } else {
                claim = this.claim;
            }
            token = jwt.encode(claim, this.key);
        }
        return "Bearer " + token;
    }
});

////////////////////////////////////////
// Exports

exports.version = version;
exports.Format = Format;
exports.Item = Item;
exports.PubControl = PubControl;
exports.Auth = {
    AuthBase: AuthBase,
    AuthBasic: AuthBasic,
    AuthJwt: AuthJwt
};

