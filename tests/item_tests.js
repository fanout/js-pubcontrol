var assert = require('assert');
var item = require('../lib/item');
var format = require('../lib/format');
var util = require('util');

var TestFormat1 = function(body) { this.body = body; };
util.inherits(TestFormat1, format.Format);
TestFormat1.prototype.name = function() { return 'testformat1'; };
TestFormat1.prototype.export = function() { return {'body': this.body}; }

var TestFormat2 = function(body) { this.body = body; };
util.inherits(TestFormat2, format.Format);
TestFormat2.prototype.name = function() { return 'testformat2'; };
TestFormat2.prototype.export = function() { return {'body': this.body}; }

var fmt1a = new TestFormat1('body1a');
var fmt1b = new TestFormat1('body1b');
var fmt2a = new TestFormat2('body2a');

(function testInitialize() {
    var itm = new item.Item(fmt1a);
    assert.equal(itm.formats[0], fmt1a);
    itm = new item.Item(fmt1a, 'id');
    assert.equal(itm.formats[0], fmt1a);
    assert.equal(itm.id, 'id');
    itm = new item.Item(fmt1a, 'id', 'prev-id');
    assert.equal(itm.formats[0], fmt1a);
    assert.equal(itm.id, 'id');
    assert.equal(itm.prevId, 'prev-id');
    itm = new item.Item([fmt1a, fmt2a]);
    assert.equal(itm.formats[0], fmt1a);
    assert.equal(itm.formats[1], fmt2a);
})();

(function testExport() {
    var itm = new item.Item(fmt1a);
    assert(!('id' in itm.export()));
    assert(!('prev-id' in itm.export()));
    assert.equal(JSON.stringify(itm.export()['testformat1']),
            JSON.stringify({'body': 'body1a'}));
    itm = new item.Item([fmt1a, fmt2a]);
    assert(!('id' in itm.export()));
    assert(!('prev-id' in itm.export()));
    assert.equal(JSON.stringify(itm.export()['testformat1']),
            JSON.stringify({'body': 'body1a'}));
    assert.equal(JSON.stringify(itm.export()['testformat2']),
            JSON.stringify({'body': 'body2a'}));
    assert.throws(
        function() {
            itm = new item.Item([fmt1a, fmt1a]);
            itm.export();
        },
        Error
    );
    itm = new item.Item(fmt1a, 'id', 'prev-id');
    assert.equal(itm.export()['id'], 'id');
    assert.equal(itm.export()['prev-id'], 'prev-id');
    assert.equal(JSON.stringify(itm.export()['testformat1']),
            JSON.stringify({'body': 'body1a'}));
})();
