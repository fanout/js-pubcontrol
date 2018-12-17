import { PubControl, Item, Format } from "pubcontrol";
import { inherits } from "util";

const defaultOpts = {
  uri: "http://api.webhookinbox.com/i/K1BiRnDW/in/",
  iss: "testPubControl defaultOpts Issuer",
  key: new Buffer("testPubControl defaultOpts realmKey", "base64"),
  defaultChannel: "testPubcontrol defaultOpts defaultChannel"
};

export const testPubcontrol = async (opts = {}) => {
  console.log("testPubcontrol", opts);
  return await testFromReadme({
    ...defaultOpts,
    ...opts
  });
};

async function testFromReadme({ uri, iss, key, defaultChannel }) {
  // const pub = new PubControl({
  //   'uri': 'https://api.fanout.io/realm/<myrealm>',
  //   'iss': '<myrealm>',
  //   'key': new Buffer('<myrealmkey', 'base64')
  // });
  const pub = new PubControl({ uri, iss, key });
  // var pubclient = new PubControlClient('<myendpoint_uri>');
  // // Optionally set JWT auth: pubclient.setAuthJwt(<claim>, '<key>');
  // // Optionally set basic auth: pubclient.setAuthBasic('<user>', '<password>');
  // pub.addClient(pubclient);

  // Publish across all configured endpoints:
  try {
    const { message, context } = await new Promise((resolve, reject) => {
      pub.publish(
        defaultChannel,
        new Item(new HttpResponseFormat("Test Publish!")),
        (success, message, context) =>
          success
            ? resolve({ success, message, context })
            : reject(
                Object.assign(new Error("Error publishing to PubControl"), {
                  message,
                  context
                })
              )
      );
    });
    console.log("Publish successful!");
    return { message, context };
  } catch (error) {
    console.error("Error publishing", error);
    console.log("Publish failed!");
    console.log("Message: " + message);
    console.log("Context: ");
    console.dir(context);
    throw error;
  }
}

const HttpResponseFormat = (() => {
  const HttpResponseFormatConstructor = function(body) {
    this.body = body;
  };
  inherits(HttpResponseFormatConstructor, Format);
  Object.assign(HttpResponseFormatConstructor.prototype, {
    name: function() {
      return "http-response";
    },
    export: function() {
      return { body: this.body };
    }
  });
  return HttpResponseFormatConstructor;
})();
