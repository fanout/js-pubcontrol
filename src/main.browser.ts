import { Buffer } from 'buffer';
import main, * as mainProps from './main';
export default main;

Object.assign(main, mainProps, { Buffer });
