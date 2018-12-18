# pubcontrol/browser-demo

A demo of building pubcontrol and using it in the browser.

Or you might want to build a service worker that you can upload to Cloudflare Workers. You can do that too.

## Running in the browser

```
make server
```

This will use webpack to build everything into `./dist/`, then run a simple http-server to serve the demo html at `http://localhost:8091?testPubControl=1&epcp.uri=http://api.webhookinbox.com/i/ljltWgzf/in/`. Go create a fresh webhook inbox to test your own.

This demo runs `./src/index.js`. But that, when run in the browser, loads `./src/webworker.js` in a webworker, and that is what ultimately uses `pubcontrol`. The demo uses built versions that webpack compiles to `./dist/`.

## Uploading to Cloudflare

See etc/cloudflare/*.sh for scripts. You'll need to set some environment variables, which the errors will tell you about if you don't provide them.

There are at least a few steps to this (though skipping to the last `make` command should work):

1. Build `./src/webworker.js` into `./dist/pubcontrol-browser-demo.webworker.js`
  
    in this browser-demo directory
    ```
    make
    ```

2. upload `./dist/pubcontrol-browser-demo.webworker.js` to Cloudflare Workers
    ```
    make cloudflare-worker-upload
    ```

3. Create a 'route' to direct traffic to that bundle
    ```
    ./etc/cloudflare/create-route.sh 'your-domain.com/*'
    ```

4. Test
    ```
    open 'http://your-domain.com/?testPubControl=1&epcp.uri=http://api.webhookinbox.com/i/ljltWgzf/in/'
    ```
    Even just loading without querystrings should at least show html from the function in `./src/webworker.js`.

### environment variables

The application may behave differently based on the following [environment variables](https://en.wikipedia.org/wiki/Environment_variable):

| variable 	| default 	| description 	|
|----------	|---------	|-------------	|
| CLOUDFLARE_EMAIL   |  | email address of your Cloudflare account |
| CLOUDFLARE_AUTH_KEY | | API Key for your cloudflare account |
| CLOUDFLARE_ZONE_ID | | Zone ID of your Cloudflare Zone, which corresponds to a domain name |
