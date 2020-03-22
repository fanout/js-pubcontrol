import Auth from './utils/auth/index';
import Format from './data/Format';
import Item from './data/Item';
import PubControl from './engine/PubControl';
import PubControlClient from './engine/PubControlClient';

import IFormat from './data/IFormat';
import IFormatExport from './data/IFormatExport';
import IItem from './data/IItem';
import IItemExport from './data/IItemExport';
import IPubControlConfig from './engine/IPubControlConfig';
import IPubControlPublishCallback from "./engine/IPubControlPublishCallback";

class ExportObject extends PubControl {
    static Auth = Auth;
    static Format = Format;
    static Item = Item;
    static PubControlClient = PubControlClient;
}
export default ExportObject;

export type {
    IFormat,
    IFormatExport,
    IItem,
    IItemExport,
    IPubControlConfig,
    IPubControlPublishCallback,
}
