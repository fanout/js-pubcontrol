/*
 * node-pubcontrol
 * (C) 2015 Fanout, Inc.
 * File name: item.js
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * File contains: the Item class.
 * Licensed under the MIT License, see file COPYING for details.
 */

var utilities = require('./utilities');

// The Item class is a container used to contain one or more format
// implementation instances where each implementation instance is of a
// different type of format. An Item instance may not contain multiple
// implementations of the same type of format. An Item instance is then
// serialized into a hash that is used for publishing to clients.
var Item = utilities.defineClass(function(formats, id, prevId) {

    // The initialize method can accept either a single Format implementation
    // instance or an array of Format implementation instances. Optionally
    // specify an ID and/or previous ID to be sent as part of the message
    // published to the client.
    var formats = utilities.isArray(formats) ? formats : [formats];
    this.formats = formats;
    if (arguments.length >= 3) {
        this.prevId = prevId;
    }
    if (arguments.length >= 2) {
        this.id = id;
    }
}, {

    // The export method serializes all of the formats, ID, and previous ID
    // into a hash that is used for publishing to clients. If more than one
    // instance of the same type of Format implementation was specified then
    // an error will be raised.
    export: function() {
        var formatNames = [];
        this.formats.forEach(function(format) {
            var formatName = format.name();
            if (formatNames.indexOf(formatName) >= 0) {
                throw new Error('More than one instance of ' + 
                    formatName + ' specified');
            }
            formatNames.push(formatName);
        });
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

exports.Item = Item;
