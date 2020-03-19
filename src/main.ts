import Auth from './utils/auth/index';
import Format from './data/Format';
import Item from './data/Item';
import PubControl from './engine/PubControl';
import PubControlClient from './engine/PubControlClient';

class ExportObject extends PubControl {
    static Auth = Auth;
    static Format = Format;
    static Item = Item;
    static PubControlClient = PubControlClient;
}

export default ExportObject;
