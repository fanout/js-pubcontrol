# js-pubcontrol-browser-demo

A demo of using the browser build of PubControl in the browser.

Due to limitations in Pushpin, you will not be able to run this demo
in a web browser against Pushpin directory.  You will have to either proxy
requests to Pushpin, or you may use a Fanout cloud account (the free tier is
enough to run this demo).

## Usage

You will need the following information from the Fanout cloud account:

* The Realm ID
* The Realm Key

Click through to the SSE test page for your account, and then leave this page
open in a browser window.

In the parent directory, build `js-pubcontrol`.  Then open `index.html` in a browser.

In the form, enter:

* Channel: `test`
* Message: any message you like, such as `Hello, World!`
* Publish URI: http://api.fanout.io/realm/<realm-id>
* Claim ISS (realm id): Your realm ID
* Claim Key (realm key): Your realm Key

Click the Publish button.  You should see `Publish successful!` below the Publish
button.

Click back to the window with the SSE test page. On the SSE test page, there is
a gray box that is subscribed to the `test` channel.  When you click the publish
button as above, you should see the message that you typed appear in the gray box.
