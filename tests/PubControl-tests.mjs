#!/usr/bin/env node
import assert from "assert";

import PubControl from "../esm/engine/PubControl.mjs";
import PubControlClient from "../esm/engine/PubControlClient.mjs";
import PublishException from "../esm/data/PublishException.mjs";

(function testInitialize() {
    let pc = new PubControl();
    assert.equal(pc.clients.length, 0);
    pc = new PubControl({ uri: "uri", iss: "iss", key: "key==" });
    assert.equal(pc.clients.length, 1);
})();

(function testRemoveAllClients() {
    const pc = new PubControl({ uri: "uri", iss: "iss", key: "key==" });
    assert.equal(pc.clients.length, 1);
    pc.removeAllClients();
    assert.equal(pc.clients.length, 0);
})();

(function testAddClient() {
    const pc = new PubControl({ uri: "uri", iss: "iss", key: "key==" });
    assert.equal(pc.clients.length, 1);
    pc.addClient(new PubControlClient("uri"));
    assert.equal(pc.clients.length, 2);
})();

(function testApplyConfig() {
    const pc = new PubControl();
    pc.applyConfig({ uri: "uri", iss: "iss", key: "key==" });
    assert.equal(pc.clients.length, 1);
    assert.equal(pc.clients[0].uri, "uri");
    assert.equal(pc.clients[0].auth.claim["iss"], "iss");
    assert.equal(pc.clients[0].auth.key, "key==");
    pc.applyConfig([
        { uri: "uri2", iss: "iss2", key: "key==2" },
        { uri: "uri3", iss: "iss3", key: "key==3" }
    ]);
    assert.equal(pc.clients.length, 3);
    assert.equal(pc.clients[0].uri, "uri");
    assert.equal(pc.clients[0].auth.claim["iss"], "iss");
    assert.equal(pc.clients[0].auth.key, "key==");
    assert.equal(pc.clients[1].uri, "uri2");
    assert.equal(pc.clients[1].auth.claim["iss"], "iss2");
    assert.equal(pc.clients[1].auth.key, "key==2");
    assert.equal(pc.clients[2].uri, "uri3");
    assert.equal(pc.clients[2].auth.claim["iss"], "iss3");
    assert.equal(pc.clients[2].auth.key, "key==3");
})();

(async function testPublish() {
    let wasPublishCalled = false;
    const pc = new PubControl();
    pc.addClient({
        publish: function(channel, item, callback) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            assert.equal(callback, null);
            wasPublishCalled = true;
        }
    });
    await pc.publish("chan", "item");
    assert(wasPublishCalled);
})();

(function testPublishCallback() {
    let callbackResult = null;
    let calls = 2;
    const pc = new PubControl();
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            calls--;
        }
    });
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            calls--;
        }
    });
    pc.publish("chan", "item", (flag, message, context) => {
        callbackResult = { flag, message, context };
    });
    process.on('beforeExit', () => {
        assert.equal(calls, 0);
        assert.ok(callbackResult.flag);
        assert.equal(callbackResult.message, null);
        assert.equal(callbackResult.context, null);
    });
})();

(function testPublishCallbackFail() {
    let results = null;
    const pc = new PubControl();
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
        }
    });
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            throw new PublishException("error 2", { value: 2 });
        }
    });
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            throw new PublishException("error 3", { value: 3 });
        }
    });
    pc.publish("chan", "item", (flag, message, context) => {
        results = { flag, message, context };
    });
    process.on('beforeExit', () => {
        assert.notEqual(results, null);
        assert.equal(results.flag, false);
        assert.equal(results.message, "error 2");
        assert.equal(results.context.value, 2)
    });
})();

(async function testPublishAsync() {
    let calls = 2;
    const pc = new PubControl();
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            calls--;
        }
    });
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            calls--;
        }
    });
    await pc.publish("chan", "item");
    assert.equal(calls, 0);
})();

(async function testPublishAsyncFail() {
    const pc = new PubControl();
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
        }
    });
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            throw new PublishException("error 2", { value: 2 });
        }
    });
    pc.addClient({
        publish: function(channel, item) {
            assert.equal(item, "item");
            assert.equal(channel, "chan");
            throw new PublishException("error 3", { value: 3 });
        }
    });
    let resultEx = null;
    await assert.rejects(async () => {
        await pc.publish("chan", "item");
    }, ex => {
        resultEx = ex;
        return true;
    });
    assert.ok(resultEx instanceof PublishException);
    assert.equal(resultEx.message, "error 2");
    assert.equal(resultEx.context.value, 2)
})();
