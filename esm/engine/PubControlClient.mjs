import 'isomorphic-fetch';
import agentkeepalive from 'agentkeepalive';

import * as auth from '../utils/auth/index.mjs';
import PublishException from "../data/PublishException.mjs";
import { utf8ByteLength } from "../utils/bufferUtilities.mjs";

// The PubControlClient class allows consumers to publish to an endpoint of
// their choice. The consumer wraps a Format class instance in an Item class
// instance and passes that to the publish method. The publish method has
// an optional callback parameter that is called after the publishing is
// complete to notify the consumer of the result.
export default class PubControlClient {
    uri;
    auth = null;
    httpKeepAliveAgent = new agentkeepalive();
    httpsKeepAliveAgent = new agentkeepalive.HttpsAgent();

    constructor(uri) {
        // Initialize this class with a URL representing the publishing endpoint.
        this.uri = uri.replace(/\/$/, "");
    }

    // Call this method and pass a username and password to use basic
    // authentication with the configured endpoint.
    setAuthBasic(username, password) {
        this.auth = new auth.Basic(username, password);
    }

    // Call this method and pass a claim and key to use JWT authentication
    // with the configured endpoint.
    setAuthJwt(claim, key) {
        if (key) {
            this.auth = new auth.Jwt(claim, key);
        } else {
            this.auth = new auth.Jwt(claim);
        }
    }

    // The publish method for publishing the specified item to the specified
    // channel on the configured endpoint. The callback method is optional
    // and will be passed the publishing results after publishing is complete.
    async publish(channel, item, cb = null) {
        const i = item.export();
        i.channel = channel;
        const authHeader = this.auth != null ? this.auth.buildHeader() : null;
        await this._startPubCall(this.uri, authHeader, [i], cb);
    }

    // An internal method for starting the work required for publishing
    // a message. Accepts the URI endpoint, authorization header, items
    // object, and optional callback as parameters.
    async _startPubCall(uri, authHeader, items, cb = null) {
        // Prepare Request Body
        const content = JSON.stringify({ items: items });
        // Build HTTP headers
        const headers = {
            "Content-Type": "application/json",
            "Content-Length": utf8ByteLength(content),
        };
        if (authHeader != null) {
            headers["Authorization"] = authHeader;
        }
        // Build HTTP request parameters
        const publishUri = uri + "/publish/";
        const parsed = new URL(publishUri);
        const reqParams = {
            method: "POST",
            headers: headers,
            body: content,
        };
        switch (parsed.protocol) {
            case "http:":
                reqParams.agent = this.httpKeepAliveAgent;
                break;
            case "https:":
                reqParams.agent = this.httpsKeepAliveAgent;
                break;
            default:
                await new Promise(resolve => setTimeout(resolve, 0));
                this._handleResult(false, 'Bad URI', { statusCode: -2 });
                return;
        }
        await this._performHttpRequest(fetch, publishUri, reqParams, cb);
    }

    // An internal method for performing the HTTP request for publishing
    // a message with the specified parameters.
    async _performHttpRequest(transport, uri, reqParams, cb = null) {
        let res = null;

        try {
            res = await transport(uri, reqParams);
        } catch(err) {
            this._handleResult(false, err.message, { statusCode: -1 });
            return;
        }

        const context = {
            statusCode: res.status,
            headers: res.headers
        };
        try {
            const data = await res.text();
            await this._finishHttpRequest("end", data, context, cb);
        } catch(err) {
            await this._finishHttpRequest("close", err, context, cb);
        }
    }

    // An internal method for finishing the HTTP request for publishing
    // a message.
    async _finishHttpRequest(mode, httpData, context, cb = null) {
        context.httpBody = httpData;
        let success;
        let message;
        if (mode === "end") {
            success = context.statusCode >= 200 && context.statusCode < 300;
            message = success ? "" : JSON.stringify(context.httpBody);
        } else if (mode === "close") {
            success = false;
            message = "Connection closed unexpectedly";
        }
        this._handleResult(success, message, context, cb);
        return { success, message, context };
    }

    _handleResult(success, message, context, cb = null) {
        if (cb != null) {
            if (success) {
                cb(true);
            } else {
                cb(false, message, context);
            }
        } else {
            if (!success) {
                throw new PublishException(message, context);
            }
        }
    }
};
