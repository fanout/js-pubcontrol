# PubControl for JavaScript

Authors: Katsuyuki Ohmuro <harmony7@pex2.jp>, Konstantin Bokarius <kon@fanout.io>

## Description

An EPCP library for NodeJS

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

## Sample Usage

This example illustrates the process of instantiating the PubControl publisher
class, defining a data format, and then publishing some data.

```javascript
import PubControl, { Format, Item } from '@fanoutio/pubcontrol';

// Instantiate PubControl publisher.
const pub = new PubControl({
    'uri': 'http://www.example.com/path/to/endpoint'
});

// Define a data format.
class HttpResponseFormat extends Format {
    body;
    constructor(body) {
        super();
        this.body = body;
    }
    name() {
        return 'http-response';
    }
    export() {
        return { body: this.body, };
    }
}

// Publish across all configured endpoints.
const item = new Item(new HttpResponseFormat('Test Publish!'));
pub.publish('my-channel', item)
    .then(() => {
        console.log('Publish successful!');
    })
    .catch(({message, context}) => {
        console.log('Publish failed!');
        console.log('Message: ' + message);
        console.log('Context: ');
        console.dir(context); 
    });
```

## Configuration

PubControl offers several ways of configuring endpoints.  The simplest way
is by specifying an object with a `uri` and optional `iss` and `key` fields. 

```javascript
const pub = new PubControl({
    'uri': 'https://api.fanout.io/realm/<myrealm>',
    'iss': '<myrealm>',
    'key': Buffer.from('<myrealmkey>', 'base64'),
});

// In a browser setting, use the following, as Buffer is not available to
// browser scripts.
// 'key': PubControl.base64ToBuffer('<myrealmkey>'),
``` 

An advanced usage is to create an instance of a `PubControlClient` and add it to the
PubControl instance yourself.  This allows for finer tuning of authentication used
by the client.

```javascript
import PubControl, { PubControlClient } from '@fanoutio/pubcontrol';

const pub = new PubControl();

// Define the endpoint:
const pubclient = new PubControlClient('<myendpoint_uri>');
// Optionally set JWT auth: pubclient.setAuthJwt(<claim>, '<key>');
// Optionally set basic auth: pubclient.setAuthBasic('<user>', '<password>');
pub.addClient(pubclient);
```

Additionally, multiple endpoints can be included in a single configuration.

```javascript
// Initialize PubControl with a single endpoint:
const pub = new PubControl();

// Add new endpoints by applying an endpoint configuration:
pub.applyConfig([
    {'uri': '<myendpoint_uri_1>'},
    {'uri': '<myendpoint_uri_2>'},
]);
```

If you ever need to clear all configured endpoints, call the `removeAllClients`
function.

```javascript
// Remove all configured endpoints:
pub.removeAllClients();
```

## Authentication

In some cases, the EPCP endpoint requires authentication before allowing its
use. This library can provide Basic and JWT authentication for these cases.

To use Basic authentication, create an instance of the `PubControlClient` class,
use `setBasicAuth()` to set the username and password, and add the instance to
the `PubControl` instance via `addClient()` as shown in the example above.

To use JWT authentication, pass a configuration to `PubControl` when instantiating
it or via `applyConfig()` and provide the claim as shown in the example above.

If the claim does not contain an `exp` value, then this library will create an
appropriate value for that field on each use. Since the header is generated
from the authorization object each time it needs to be used, the library is
able to generate a new authorization header, even from the same auth object.

It is also possible to use a literal JWT string for JWT authentication.
This may be useful in certain cases, such as when you are performing a push
request on behalf of another service. That service can pre-encode the JWT
token and hand it to you in its string representation. This way, that service
does not need to hand the JWT signing key to you.

```javascript
pubClient.setAuthJwt('######.######.######'); // Literal JWT string
```

## Tests

The tests in this package require Node.js 12 or newer to run.  This is because
the tests run against the source JavaScript modules directly, which is
a feature that was supported starting with Node.js 12.

(The runtime will work with lower versions of node and with browsers since they
go through a transpile step.)

## Consuming this library

### ESM

If you are using Node 12.0 or newer or building a bundle for a browser using a
modern bundler, you can use this package as an ESM module.  Install it as an
npm package:

```bash
npm install @fanoutio/pubcontrol
```

Import in your JavaScript:

```javascript
import PubControl, { Item, Format, } from '@fanoutio/pubcontrol';
const pub = new PubControl({uri: "<endpoint_uri>"});
```

### CommonJS

This package is a hybrid package, and a CommonJS version of the library is
available by specifying a deep path.  You will also need to install the dependency
`@babel/runtime-corejs3` directly:

```bash
npm install @fanoutio/pubcontrol @babel/runtime-corejs3 core-js@3
```

Require in your JavaScript:

```javascript
const PubControl = require('@fanoutio/pubcontrol/commonjs');
const pub = new PubControl({uri: "<endpoint_uri>"});
const { Format, Item } = PubControl;
```

### As a script tag in web browsers

A build for browsers is available as the `/browser/pubcontrol.js` file in the npm package,
or by running `npm run build-browser` to build it. This may be included as a normal `<script>`
tag on your web page:

```html
<script src="./node_modules/@fanoutio/pubcontrol/browser/pubcontrol.js"></script>
```

Of course, you may copy the file into your project and point to it instead.

In this usage, `PubControl` is introduced to the global namespace.

```javascript
const pub = new PubControl({uri: "<endpoint_uri>"});
const { Format, Item } = PubControl;
```

An example for this is included at `./demo/index.html`.  Open this page in your
browser after you have built the `/browser/pubcontrol.js` file.  

## Demos

For more examples, see the `js-pubcontrol-demos` repository.

## License

(C) 2015, 2019 Fanout, Inc.  
Licensed under the MIT License, see file COPYING for details.
