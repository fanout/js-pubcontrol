import assert from "assert";

import PubControl from "../src/engine/PubControl";
import PubControlClient from "../src/engine/PubControlClient";
import PublishException from "../src/data/PublishException";
import Jwt from "../src/utils/auth/Jwt";
import Item from "../src/data/Item";

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
    assert.equal((<Jwt>pc.clients[0].auth).claim["iss"], "iss");
    assert.equal((<Jwt>pc.clients[0].auth).key, "key==");
    pc.applyConfig([
        { uri: "uri2", iss: "iss2", key: "key==2" },
        { uri: "uri3", iss: "iss3", key: "key==3" }
    ]);
    assert.equal(pc.clients.length, 3);
    assert.equal(pc.clients[0].uri, "uri");
    assert.equal((<Jwt>pc.clients[0].auth).claim["iss"], "iss");
    assert.equal((<Jwt>pc.clients[0].auth).key, "key==");
    assert.equal(pc.clients[1].uri, "uri2");
    assert.equal((<Jwt>pc.clients[1].auth).claim["iss"], "iss2");
    assert.equal((<Jwt>pc.clients[1].auth).key, "key==2");
    assert.equal(pc.clients[2].uri, "uri3");
    assert.equal((<Jwt>pc.clients[2].auth).claim["iss"], "iss3");
    assert.equal((<Jwt>pc.clients[2].auth).key, "key==3");
})();

(async function testPublish() {
    let wasPublishCalled = false;
    const testItem = <Item>{};
    const pc = new PubControl();
    pc.addClient(<PubControlClient>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            wasPublishCalled = true;
        }
    });
    await pc.publish("chan", testItem);
    assert(wasPublishCalled);
})();

(function testPublishCallback() {
    let callbackResult = null;
    const testItem = <Item>{};
    let calls = 2;
    const pc = new PubControl();
    pc.addClient(<PubControlClient>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            calls--;
        }
    });
    pc.addClient(<PubControlClient>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            calls--;
        }
    });
    pc.publish("chan", testItem, (flag, message, context) => {
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
    const testItem = <Item>{};
    const pc = new PubControl();
    pc.addClient(<PubControlClient>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
        }
    });
    pc.addClient(<PubControlClient><unknown>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            throw new PublishException("error 2", {value: 2});
        }
    });
    pc.addClient(<PubControlClient><unknown>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            throw new PublishException("error 3", {value: 3});
        }
    });
    pc.publish("chan", testItem, (flag, message, context) => {
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
    const testItem = <Item>{};
    let calls = 2;
    const pc = new PubControl();
    pc.addClient(<PubControlClient>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            calls--;
        }
    });
    pc.addClient(<PubControlClient>{
        publish: async function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            calls--;
        }
    });
    await pc.publish("chan", testItem);
    assert.equal(calls, 0);
})();

(async function testPublishAsyncFail() {
    const testItem = <Item>{};
    const pc = new PubControl();
    pc.addClient(<PubControlClient>{
        publish: function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
        }
    });
    pc.addClient(<PubControlClient><unknown>{
        publish: function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            throw new PublishException("error 2", {value: 2});
        }
    });
    pc.addClient(<PubControlClient><unknown>{
        publish: function (channel, item) {
            assert.equal(channel, "chan");
            assert.equal(item, testItem);
            throw new PublishException("error 3", {value: 3});
        }
    });
    let resultEx = null;
    await assert.rejects(async () => {
        await pc.publish("chan", testItem);
    }, ex => {
        resultEx = ex;
        return true;
    });
    assert.ok(resultEx instanceof PublishException);
    assert.equal(resultEx.message, "error 2");
    assert.equal(resultEx.context.value, 2)
})();
