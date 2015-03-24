var assert = require('assert');
var util = require('util');
var pubcontrol = require('../lib/pubcontrol')

var TestFormat = function(body) { this.body = body; };
util.inherits(TestFormat, pubcontrol.Format);
TestFormat.prototype.name = function() { return 'testformat'; };
TestFormat.prototype.export = function() { return {'body': this.body}; };
var TestItem = new pubcontrol.Item();

(function testInitialize() {
    var pc = new pubcontrol.PubControl();
    assert.equal(pc.clients.length, 0);
    var pc = new pubcontrol.PubControl({ 'uri': 'uri',
            'iss': 'iss',
            'key': 'key==' });
    assert.equal(pc.clients.length, 1);
})();

(function testRemoveAllClients() {
    var pc = new pubcontrol.PubControl({ 'uri': 'uri',
            'iss': 'iss',
            'key': 'key==' });
    assert.equal(pc.clients.length, 1);
    pc.removeAllClients();
    assert.equal(pc.clients.length, 0);
})();

(function testAddClient() {
    var pc = new pubcontrol.PubControl({ 'uri': 'uri',
            'iss': 'iss',
            'key': 'key==' });
    assert.equal(pc.clients.length, 1);
    pc.addClient(new pubcontrol.PubControlClient('uri'));
    assert.equal(pc.clients.length, 2);
})();

(function testApplyConfig() {
    var pc = new pubcontrol.PubControl();
    pc.applyConfig({ 'uri': 'uri',
            'iss': 'iss',
            'key': 'key==' });
    assert.equal(pc.clients.length, 1);
    assert.equal(pc.clients[0].uri, 'uri');
    assert.equal(pc.clients[0].auth.claim['iss'], 'iss');
    assert.equal(pc.clients[0].auth.key, 'key==');
    pc.applyConfig([{ 'uri': 'uri2',
            'iss': 'iss2',
            'key': 'key==2' },
          { 'uri': 'uri3',
            'iss': 'iss3',
            'key': 'key==3'}]);
    assert.equal(pc.clients.length, 3);
    assert.equal(pc.clients[0].uri, 'uri');
    assert.equal(pc.clients[0].auth.claim['iss'], 'iss');
    assert.equal(pc.clients[0].auth.key, 'key==');
    assert.equal(pc.clients[1].uri, 'uri2');
    assert.equal(pc.clients[1].auth.claim['iss'], 'iss2');
    assert.equal(pc.clients[1].auth.key, 'key==2');
    assert.equal(pc.clients[2].uri, 'uri3');
    assert.equal(pc.clients[2].auth.claim['iss'], 'iss3');
    assert.equal(pc.clients[2].auth.key, 'key==3');
})();

(function testPublish() {
    var wasPublishCalled = false;
    var pc = new pubcontrol.PubControl();
    pc.addClient({ publish: function(channel, item, callback) {
        assert.equal(item, 'item');
        assert.equal(channel, 'chan');
        assert.equal(callback, null);   
        wasPublishCalled = true;
    }});
    pc.publish('chan', 'item');
    assert(wasPublishCalled);
})();

(function testPublishCallback() {
    var callback = function() {};
    var wasPublishCalled = false;
    var pc = new pubcontrol.PubControl();
    pc.addClient({ publish: function(channel, item, cb) {
        assert.equal(item, 'item');
        assert.equal(channel, 'chan');
        assert.equal(cb.numCalls, 2);   
        assert.equal(cb.callback, callback);   
        wasPublishCalled = true;
    }});
    pc.addClient({ publish: function(channel, item, cb) {
        assert.equal(item, 'item');
        assert.equal(channel, 'chan');
        assert.equal(cb.numCalls, 2);   
        assert.equal(cb.callback, callback); 
        wasPublishCalled = true;
    }});
    pc.publish('chan', 'item', callback);
    assert(wasPublishCalled);
})();
