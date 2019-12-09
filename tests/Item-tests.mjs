#!/usr/bin/env node
import assert from "assert";

import Item from '../src/data/Item.mjs';
import Format from '../src/data/Format.mjs';

class TestFormat1 extends Format {
    body;
    constructor(body) {
        super();
        this.body = body;
    }
    name() {
        return 'testformat1';
    }
    export() {
        return { body: this.body };
    }
}

class TestFormat2 extends Format {
    body;
    constructor(body) {
        super();
        this.body = body;
    }
    name() {
        return 'testformat2';
    }
    export() {
        return { body: this.body };
    }
}

const fmt1a = new TestFormat1("body1a");
const fmt2a = new TestFormat2("body2a");

(function testInitialize() {
    let itm = new Item(fmt1a);
    assert.equal(itm.formats[0], fmt1a);
    itm = new Item(fmt1a, "id");
    assert.equal(itm.formats[0], fmt1a);
    assert.equal(itm.id, "id");
    itm = new Item(fmt1a, "id", "prev-id");
    assert.equal(itm.formats[0], fmt1a);
    assert.equal(itm.id, "id");
    assert.equal(itm.prevId, "prev-id");
    itm = new Item([fmt1a, fmt2a]);
    assert.equal(itm.formats[0], fmt1a);
    assert.equal(itm.formats[1], fmt2a);
})();

(function testExport() {
    let itm = new Item(fmt1a);
    assert(!("id" in itm.export()));
    assert(!("prev-id" in itm.export()));
    assert.equal(
        JSON.stringify(itm.export()["testformat1"]),
        JSON.stringify({ body: "body1a" })
    );
    itm = new Item([fmt1a, fmt2a]);
    assert(!("id" in itm.export()));
    assert(!("prev-id" in itm.export()));
    assert.equal(
        JSON.stringify(itm.export()["testformat1"]),
        JSON.stringify({ body: "body1a" })
    );
    assert.equal(
        JSON.stringify(itm.export()["testformat2"]),
        JSON.stringify({ body: "body2a" })
    );
    assert.throws(function() {
        itm = new Item([fmt1a, fmt1a]);
        itm.export();
    }, Error);
    itm = new Item(fmt1a, "id", "prev-id");
    assert.equal(itm.export()["id"], "id");
    assert.equal(itm.export()["prev-id"], "prev-id");
    assert.equal(
        JSON.stringify(itm.export()["testformat1"]),
        JSON.stringify({ body: "body1a" })
    );
})();
