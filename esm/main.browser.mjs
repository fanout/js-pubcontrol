import 'core-js';
import 'regenerator-runtime/runtime';

import * as PubControl from './main.mjs';

const defaultExport = PubControl['default'];
delete PubControl['default'];
Object.assign(defaultExport, PubControl);

export default defaultExport;
