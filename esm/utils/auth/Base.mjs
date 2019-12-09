// The authorization base class for building auth headers in conjunction
// with HTTP requests used for publishing messages.
export default class Base {
    // This method should return the auth header in text format.
    buildHeader() {
        return null;
    }
}
