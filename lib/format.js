/*
 * node-pubcontrol
 * (C) 2015 Fanout, Inc.
 * File name: format.js
 * File authors:
 * Katsuyuki Ohmuro <harmony7@pex2.jp>
 * Konstantin Bokarius <kon@fanout.io>
 * File contains: the Format abstract class.
 * Licensed under the MIT License, see file COPYING for details.
 */

var utilities = require('./utilities');

// The Format class is provided as a base class for all publishing
// formats that are included in the Item class. Examples of format
// implementations include JsonObjectFormat and HttpStreamFormat.
var Format = utilities.defineClass({

    // The name of the format which should return a string. Examples
    // include 'json-object' and 'http-response'
    name: function() { return null; },

    // The export method which should return a format-specific hash
    // containing the required format-specific data.
    export: function() { return null; }
});

exports.Format = Format;
