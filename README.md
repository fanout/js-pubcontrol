nodepubcontrol - PubControl for NodeJS
======================================

Version: v 0.2.0  
Date: April 18th, 2013  
Author: Katsuyuki Ohmuro <harmony7@pex2.jp>

Description
-----------

EPCP library for NodeJS

HTTP Extensible Pubsub Control Protocol (EPCP) defines a generalized and
extensible data publishing protocol using HTTP.  Data is published by way of
HTTP POST, whose content is the JSON string representation of an object that
follows certain structural guidelines.

Each message consists of one or more data items, and is always sent to a
specified channel.  The messages are associated with that channel and will
only be delivered to those listeners subscribed to the channel.

This library contains a Format base class and a PubControl class that is used
to send messages.  This library also supports the case when the EPCP endpoint
requires certain types of authentication.

Requirements
------------

    jwt-simple

Sample Usage
------------

This example illustrates the process of instantiating the PubControl publisher
class, defining a data format, and then publishing some data.

    // This example defines a custom format in terms of
    // EPCP and publishes via a custom server at a specified endpoint.

    var util = require('util');
    var pubcontrol = require('pubcontrol');

    // Create publisher for endpoint
    var pub = new pubcontrol.PubControl("http://example.com/path/to/endpoint");

    // Define format.  Use NodeJS's utilities to inherit methods from Format.
    var MyFormat = function(data) { this.data = data; };
    util.inherits(MyFormat, pubcontrol.Format);
    MyFormat.prototype.name = function() { return "my-format"; };
    MyFormat.prototype.export = function() { return {"data": this.data}; }

    // Publish message
    pub.publish("test", new pubcontrol.Item(new MyFormat("hello world")), function(success, message, context) {
        console.log(success);
        console.log(message);
        console.dir(context);
    });

In some cases, the EPCP endpoint requires authentication before allowing its
use.  This library can provide Basic and JWT authentication for these cases.

To use Basic authentication, use the pubcontrol.Auth.AuthBasic class:

    // Create publish for endpoint using basic auth
    var endpoint = "http://example.com/path/to/endpoint";
    var auth = new pubcontrol.Auth.AuthBasic("username", "password");
    var pub = new pubcontrol.PubControl(endpoint, auth);

To use JWT authentication, use the pubcontrol.Auth.AuthJwt class:

    // Create publish for endpoint using JWT auth
    var endpoint = "http://example.com/path/to/endpoint";
    var auth = new pubcontrol.Auth.AuthJwt({iss: "name"}, "secret");
    var pub = new pubcontrol.PubControl(endpoint, auth);

If the claim does not contain an exp value, then this library will create an
appropriate value for that field on each use.  Since the header is generated
from the authorization object each time it needs to be used, the library is
able to generate a new authorization header, even from the same auth object.

It is also possible to use a literal JWT string for JWT authentication.
This may be useful in certain cases, such as when you are performing a push
request on behalf of another service.  That service can preencode the JWT
token and hand it to you in its string representation.  This way, that service
does not need to hand the JWT signing key to you.

    // Create publish for endpoint using JWT auth (literal token)
    var endpoint = "http://example.com/path/to/endpoint";
    var auth = new pubcontrol.Auth.AuthJwt("######.######.######"); // Literal JWT string
    var pub = new pubcontrol.PubControl(endpoint, auth);

Other than the above authentication schemes, this library also defines the
AuthBase base class that declares the buildHeader() method.  If the EPCP server
happens to require any other type of authorization header, simply create a class
that inherits from the AuthBase class and implement its buildHeader() method
appropriately. Then, instantiate the class and use it with the PubControl class.

License
-------

(C) 2013 Fan Out Networks, Inc.  
Licensed under the MIT License, see file COPYING for details.
