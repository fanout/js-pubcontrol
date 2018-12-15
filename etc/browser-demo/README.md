# pubcontrol/browser-demo

A demo of building pubcontrol and using it in the browser.

Or you might want to build a service worker that you can upload to Cloudflare Workers.
That's what I'm doing.

## Uploading to Cloudflare

`make cloudflare-worker-upload`

See etc/cloudflare/*.sh for scripts. You'll need to set some environment variables, which the errors will tell you about if you don't provide them.
