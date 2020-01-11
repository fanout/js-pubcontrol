export default class PublishException {
    message;
    context;

    constructor(message, context) {
        this.message = message;
        this.context = context;
    }
}