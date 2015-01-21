/*
 * nodepubcontrol
 * An EPCP library for NodeJS
 * (C) 2014 Fanout, Inc.
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * Licensed under the MIT License, see file COPYING for details.
 */

// Version String
var version = '1.0.0';

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

// Check if input is a buffer already.
// If not, turn it into a string and then encode the bits of its UTF-8 representation
// into a new Buffer.
var toBuffer = function(input) {
    return Buffer.isBuffer(input) ? input : new Buffer(input.toString(), 'utf8');
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
        if('id' in this) {
            obj['id'] = this.id;
        }
        if('prevId' in this) {
            obj['prev-id'] = this.prevId;
        }
        this.formats.forEach(function(format) {
            obj[format.name()] = format.export();
        });
        return obj;
    }
});

// PubControlClientCallbackHandler class
var PubControlClientCallbackHandler = defineClass(function(numCalls, callback) {
    this.numCalls = numCalls;
    this.callback = callback;
    this.success = true;
    this.firstErrorMessage = null;
    this.firstErrorContext = null;
}, {
    handler: function(success, message, context) {
        if (!success && this.success) {
            this.success = false;
            this.firstErrorMessage = message;
            this.firstErrorContext = context;
        }
        this.numCalls -= 1;
        if (this.numCalls <= 0) {
            applyCallback(this.success, this.callback, this.firstErrorMessage,
                    this.firstErrorContext);
        }
    }
});

// PubControlClient publisher class
var PubControlClient = defineClass(function(uri) {
    this.uri = uri;
    this.auth = null;
}, {
    setAuthBasic: function(username, password) {
        this.auth = new AuthBasic(username, password);
    },
    setAuthJwt: function(claim, key) {
        if (key) {
            this.auth = new AuthJwt(claim, key);
        }
        else {
            this.auth = new AuthJwt(claim);
        }
    },
    publish: function(channel, item, cb) {
        var i = item.export();
        i['channel'] = channel;
        var authHeader = this.auth != null ? this.auth.buildHeader() : null;
        publishCallWorker(this.uri, authHeader, [i], cb);
    }
});

// PubControl class
var PubControl = defineClass(function(config) {
    if (arguments.length == 1) {
        this.applyConfig(config);
    }
    else {
        this.clients = [];
    }
}, {
    removeAllClients: function() {
        this.clients = [];
    },
    addClient: function(client) {
        this.clients.push(client);
    },
    applyConfig: function(config) {
        clients = [];
        if (typeof this.clients !== 'undefined') {
            clients = this.clients;
        }
        var config = isArray(config) ? config : [config];
        config.forEach(function(entry) {
            var client = new PubControlClient(entry['uri']);
            if ('iss' in entry) {
                client.setAuthJwt({'iss': entry['iss']}, entry['key']);
            }
            clients.push(client);
        });
        this.clients = clients;
    },
    publish: function(channel, item, cb) {
        callback = null;
        if(isFunction(cb)) {
            pcccbhandler = new PubControlClientCallbackHandler(
                    this.clients.length, cb);
            callback = function (success, message, context) { 
                    pcccbhandler.handler(success, message, context)};
        }
        this.clients.forEach(function(client) {
            client.publish(channel, item, callback);
        });
    }
});

// Publish Call Worker
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
    var reqParams = extend(url.parse(publishUri), {
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
            applyCallback(false, cb, 'Bad URI', {
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
            applyCallback(success, cb, message, context);
        };
        res.setEncoding('utf8');
        res.on('data', function(data) {
            httpData.push(data);
        });
        res.on('end', function() { finishRequest('end'); });
        res.on('close', function() { finishRequest('close'); });
    });
    req.on('error', function(e) {
        applyCallback(false, cb, e.message, {
            statusCode: -1
        });
    });
    req.write(content);
    req.end();
};

// Apply callback method
var applyCallback = function(status, cb, message, context) {
    if(isFunction(cb)) {
        cb(status, message, context);
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
        var data = this.user + ':' + this.pass;
        return 'Basic ' + new Buffer(data).toString('base64');
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
        this.key = toBuffer(key);
        this.token = null;
    }
}, {
    buildHeader: function() {
        var token;
        if(this.token != null) {
            token = this.token;
        } else {
            var claim;
            if(!('exp' in this.claim)) {
                claim = extend({}, this.claim, {
                    exp: Math.floor(new Date().getTime()/1000) + 600
                });
            } else {
                claim = this.claim;
            }
            token = jwt.encode(claim, this.key);
        }
        return 'Bearer ' + token;
    }
});

////////////////////////////////////////
// Exports

exports.version = version;
exports.Format = Format;
exports.Item = Item;
exports.PubControl = PubControl;
exports.PubControlClient = PubControlClient;
