import { Buffer } from 'buffer';
import PubControl, * as PubControlProps from './main.mjs';
export default PubControl;

Object.assign(PubControl, PubControlProps, { Buffer });
