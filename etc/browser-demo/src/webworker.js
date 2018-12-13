import { testPubcontrol } from "./test"

const main = async () => {
  let state = {}
  const setState = (stateUpdates) => {
    state = {...state, ...stateUpdates}
  }
  addEventListener('fetch', (event) => {
    console.debug("webworker fetch event", event)
    event.respondWith(handleRequest(event.request))
  })
  addEventListener('install', onInstall)
  addEventListener('message', onMessage)

  async function handleRequest(request) {
    const body = `
      <h1>npm pubcontrol browser-demo: webworker</h1>
      <p>It works!</p>
    `.trim()
  
    return new Response(body, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  async function onInstall (event) {
    consoe.debug("webworker onInstall", event)
  }

  async function onMessage (event) {
    console.debug('Message received from main script', event.data.type, event);
    switch (event.data.type) {
      case 'Hello':
        postMessage({
          type: 'HelloResponse',
          content: `And hello to you, ${event.data.from}`
        })
        break
      case 'EPCPConfiguration':
        setState({
          epcp: event.data,
        })
        await testPubcontrol(event.data)
        break;
      default:
        console.debug("Encountered unexpected event type", event.data.type, event)
    }
  }
}

main()