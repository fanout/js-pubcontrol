import Base from "./base.mjs";

export default class Basic extends Base {
    user;
    pass;

    constructor(user, pass) {
        super();
        // Initialize with a username and password.
        this.user = user;
        this.pass = pass;
    }

    // Returns the auth header containing the username and password
    // in Basic auth format.
    buildHeader() {
        const data = this.user + ":" + this.pass;
        return "Basic " + Buffer.from(data).toString("base64");
    }
}