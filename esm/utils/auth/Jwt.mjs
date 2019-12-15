import jwt from 'jwt-simple';
import Base from "./Base.mjs";
import { isBuffer, toUtf8Buffer } from "../bufferUtilities.mjs";

// JWT authentication class used for building auth headers containing
// JSON web token information in either the form of a claim and
// corresponding key, or the literal token itself.
export default class Jwt extends Base {
    token;
    claim;
    key;

    constructor(claim, key) {
        super();
        // Initialize with the specified claim and key. If only one parameter
        // was provided then treat it as the literal token.
        if (arguments.length === 1) {
            this.token = claim;
            this.claim = null;
            this.key = null;
        } else {
            this.token = null;
            this.claim = claim;
            this.key = isBuffer(key) ? key : toUtf8Buffer( key );
        }
    }

    // Returns the auth header containing the JWT token in Bearer format.
    buildHeader() {
        let token;
        if (this.token != null) {
            token = this.token;
        } else {
            const claim =
                "exp" in this.claim ?
                    this.claim :
                    Object.assign({}, this.claim, {
                        exp: Math.floor(new Date().getTime() / 1000) + 600
                    });
            token = jwt.encode(claim, this.key);
        }
        return "Bearer " + token;
    }
}
