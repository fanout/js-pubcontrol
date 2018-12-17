import { testPubcontrol } from "./test";

main();

/**
 * Main browser-demo webworker.
 * Listen for messages from the host page.
 * When configured for EPCP, maybe test pubcontrol with that configuration.
 */
async function main() {
  let state = {};
  const setState = stateUpdates => {
    state = { ...state, ...stateUpdates };
  };
  addEventListener("fetch", event => {
    console.debug("webworker fetch event", event);
    try {
      event.respondWith(handleRequest(event.request));
    } catch (error) {
      return new Response(
        "Something didn’t quite work. Error message: " + error.message,
        {
          status: 500
        }
      );
    }
  });
  addEventListener("install", onInstall);
  addEventListener("message", onMessage);

  async function handleRequest(request) {
    console.log("in handleRequest");
    const url = new URL(request.url);
    let testPubcontrolError;
    let testPubControlResult;
    try {
      testPubControlResult = url.searchParams.get("testPubControl")
        ? await testPubcontrol({
            uri: url.searchParams.get("epcp.uri"),
            defaultChannel: url.searchParams.get("epcp.defaultChannel")
          })
        : {
            message:
              "No ?testPubControl, so I didn't run anything related to epcp"
          };
    } catch (error) {
      testPubcontrolError = error;
    }

    let formattedTestPubControlResult;
    try {
      formattedTestPubControlResult = JSON.stringify(testPubControlResult);
    } catch (error) {
      formattedTestPubControlResult = `ERROR WITH IT!! ${error.message} ${
        error.stack
      }`;
    }
    let formattedTestPubControlError;
    try {
      formattedTestPubControlError =
        testPubcontrolError &&
        String(
          testPubcontrolError.message ||
            ".message was falsy so we used this text"
        );
    } catch (error) {
      formattedTestPubControlError =
        "Error getting this error.message as string";
    }
    const body = `
      <h1>npm pubcontrol browser-demo: webworker</h1>
      <p>It works!</p>
      <p>
      cpcp.url: ${url.searchParams.get("epcp.uri")}
      </p>
      <p>formattedTestPubControlResult ${formattedTestPubControlResult}</p>
      <p>formattedTestPubControlError ${formattedTestPubControlError}</p>
    `.trim();

    return new Response(body, {
      headers: { "Content-Type": "text/html" }
    });
  }

  async function onInstall(event) {
    consoe.debug("webworker onInstall", event);
  }

  async function onMessage(event) {
    console.debug("Message received from main script", event.data.type, event);
    switch (event.data.type) {
      case "Hello":
        postMessage({
          type: "HelloResponse",
          content: `And hello to you, ${event.data.from}`
        });
        break;
      case "EPCPConfiguration":
        setState({
          epcp: event.data
        });
        await testPubcontrol(event.data);
        break;
      default:
        console.debug(
          "Encountered unexpected event type",
          event.data.type,
          event
        );
    }
  }
};
