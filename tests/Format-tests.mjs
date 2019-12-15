import assert from "assert";

import Format from '../esm/data/Format.mjs';

const fmt = new Format();
assert.equal(fmt.name(), null);
assert.equal(fmt.export(), null);
