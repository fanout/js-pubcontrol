var assert = require('assert');
var format = require('../lib/format');

var fmt = new format.Format();
assert.equal(fmt.name(), null);
assert.equal(fmt.export(), null);
