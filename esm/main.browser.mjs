import 'core-js';
import 'regenerator-runtime/runtime';
import buffer from 'buffer';

import * as PubControl from './main.mjs';

const defaultExport = PubControl['default'];
for (const key of Object.keys(PubControl)) {
    if (key !== 'default') {
        defaultExport[key] = PubControl[key];
    }
}

defaultExport['Buffer'] = buffer.Buffer;

export default defaultExport;
