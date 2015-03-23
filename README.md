PubControl for NodeJS
======================================

Authors: Katsuyuki Ohmuro <harmony7@pex2.jp>, Konstantin Bokarius <kon@fanout.io>

Description
-----------

EPCP library for NodeJS

HTTP Extensible Pubsub Control Protocol (EPCP) defines a generalized and
extensible data publishing protocol using HTTP. Data is published by way of
HTTP POST, whose content is the JSON string representation of an object that
follows certain structural guidelines.

Each message consists of one or more data items, and is always sent to a
specified channel. The messages are associated with that channel and will
only be delivered to those listeners subscribed to the channel.

This library contains a Format base class and a PubControl class that is used
to send messages. This library also supports the case when the EPCP endpoint
requires certain types of authentication.

Requirements
------------

    jwt-simple

Sample Usage
------------

This example illustrates the process of instantiating the PubControl publisher
class, defining a data format, and then publishing some data.

```javascript
var util = require('util');
var pubcontrol = require('pubcontrol');

var HttpResponseFormat = function(body) { this.body = body; };
util.inherits(HttpResponseFormat, pubcontrol.Format);
HttpResponseFormat.prototype.name = function() { return 'http-response'; };
HttpResponseFormat.prototype.export = function() { return {'body': this.body}; }

var callback = function(success, message, context) {
    if (success) {
        console.log('Publish successful!');
    }
    else {
        console.log('Publish failed!');
        console.log('Message: ' + message);
        console.log('Context: ');
        console.dir(context); 
    }
};

// PubControl can be initialized with or without an endpoint configuration.
// Each endpoint can include optional JWT authentication info.
// Multiple endpoints can be included in a single configuration.

// Initialize PubControl with a single endpoint:
var pub = new pubcontrol.PubControl({
        'uri': 'https://api.fanout.io/realm/<myrealm>',
        'iss': '<myrealm>',
        'key': new Buffer('<myrealmkey', 'base64')});

// Add new endpoints by applying an endpoint configuration:
pub.applyConfig([{'uri': '<myendpoint_uri_1>'},
        {'uri': '<myendpoint_uri_2>'}]);

// Remove all configured endpoints:
pub.removeAllClients();

// Explicitly add an endpoint as a PubControlClient instance:
var pubclient = new pubcontrol.PubControlClient('<myendpoint_uri>');
// Optionally set JWT auth: pubclient.setAuthJwt(<claim>, '<key>');
// Optionally set basic auth: pubclient.setAuthBasic('<user>', '<password>');
pub.addClient(pubclient);

// Publish across all configured endpoints:
pub.publish('<channel>', new pubcontrol.Item(
        new HttpResponseFormat('Test Publish!')), callback);
```

In some cases, the EPCP endpoint requires authentication before allowing its
use. This library can provide Basic and JWT authentication for these cases. To use Basic authentication instantiate a PubControlClient class, use setBasicAuth() to set the username and password, and add the PubControlClient instance to the PubControl instance via addClient() as shown in the example above. To use JWT authentication pass a configuration to PubControl when instantiating it or via applyConfig and provide the claim as shown in the example above.

If the claim does not contain an exp value, then this library will create an
appropriate value for that field on each use. Since the header is generated
from the authorization object each time it needs to be used, the library is
able to generate a new authorization header, even from the same auth object.

It is also possible to use a literal JWT string for JWT authentication.
This may be useful in certain cases, such as when you are performing a push
request on behalf of another service. That service can preencode the JWT
token and hand it to you in its string representation. This way, that service
does not need to hand the JWT signing key to you.

```javascript
pubclient.setAuthJwt('######.######.######'); // Literal JWT string
```

License
-------

(C) 2015 Fanout, Inc.  
Licensed under the MIT License, see file COPYING for details.
