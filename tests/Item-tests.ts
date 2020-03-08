import assert from "assert";

import Item from '../src/data/Item';
import Format from '../src/data/Format';

class TestFormat1 extends Format {
    content;
    constructor(content) {
        super();
        this.content = content;
    }
    name() {
        return 'testformat1';
    }
    export() {
        return { content: this.content };
    }
}

class TestFormat2 extends Format {
    content;
    constructor(content) {
        super();
        this.content = content;
    }
    name() {
        return 'testformat2';
    }
    export() {
        return { content: this.content };
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
        JSON.stringify({ content: "body1a" })
    );
    itm = new Item([fmt1a, fmt2a]);
    assert(!("id" in itm.export()));
    assert(!("prev-id" in itm.export()));
    assert.equal(
        JSON.stringify(itm.export()["testformat1"]),
        JSON.stringify({ content: "body1a" })
    );
    assert.equal(
        JSON.stringify(itm.export()["testformat2"]),
        JSON.stringify({ content: "body2a" })
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
        JSON.stringify({ content: "body1a" })
    );
})();
