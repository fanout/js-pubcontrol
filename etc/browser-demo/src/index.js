/**
 * Main entry for browser-demo.
 * This is meant to execute in a browser (it uses `window`)
 */

main()

async function main () {
  const { window } = webContext()
  if (window) {
    await windowReadiness(window)
    render(window)
    bootWebWorker(window)
  } else {
    console.warn("No web window. Can't run browser-demo.")
  }
}

function render ({ document }) {
  // console.debug("rendering")
  // document.querySelectorAll('.replace-with-pubcontrol').forEach(el => {
  //   el.innerHTML = `
  //   <div>
  //     <h2>pubcontrol default export</h2>
  //     <pre>${JSON.stringify(objectSchema(PubControl), null, 2)}</pre>
  //   </div>
  //   `
  // })
}

function windowReadiness ({ document }) {
  if (document.readyState === "loading") {  // Loading hasn't finished yet
    return new Promise((resolve, reject) => document.addEventListener("DOMContentLoaded", resolve))
  }
}

function objectSchema (obj) {
  const props = Object.entries(obj)
  .reduce((reduced, [key, val]) => Object.assign(reduced, { [key]: typeof val }), {})
  return props
}

function webContext () {
  const window = (typeof global.window !== 'undefined') && global.window
  const document = (typeof global.document !== 'undefined') && global.document
  const context = { document, window }
  if ( ! context.document) {
    throw new Error('pubcontrol browser-demo must be run with a global document')
  }
  return context
}

function bootWebWorker ({ Worker }) {
  const webWorker = Object.assign(
    new Worker('pubcontrol-browser-demo.webworker.js'),
    {
      onmessage: (event) => {
        console.debug('Message received from worker', event.data.type, event);
      }
    },
  )
  webWorker.postMessage({
    type: 'Hello',
    from: 'browser',
    content: 'Hello worker. I booted you out here in pubcontrol-browser-demo.'
  })
  const url = new URL(global.location.href)
  const epcpConfig = {
    uri: url.searchParams.get('epcp.uri'),
    defaultChannel: url.searchParams.get('epcp.defaultChannel'),
  }
  webWorker.postMessage({
    type: 'EPCPConfiguration',
    ...epcpConfig,
  })
}
