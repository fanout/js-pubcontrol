import { PubControl, Item, Format } from "pubcontrol"
import { inherits } from "util"

const defaultOpts = {
  uri: "http://api.webhookinbox.com/i/K1BiRnDW/in/",
  iss: 'testPubControl defaultOpts Issuer',
  key: new Buffer('testPubControl defaultOpts realmKey', 'base64'),
  defaultChannel: 'testPubcontrol defaultOpts defaultChannel',
}

export const testPubcontrol = async (opts) => {
  console.log('testPubcontrol', opts)
  await testFromReadme(opts)
}

async function testFromReadme ({ uri, iss, key, defaultChannel }) {  
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
  pub.publish(
    defaultChannel,
    new Item(
      new HttpResponseFormat('Test Publish!')
    ),
    function(success, message, context) {
      if (success) {
          console.log('Publish successful!');
      }
      else {
          console.log('Publish failed!');
          console.log('Message: ' + message);
          console.log('Context: ');
          console.dir(context); 
      }
    }
  );
}

const HttpResponseFormat = (() => {
  const HttpResponseFormatConstructor = function(body) { this.body = body; };
  inherits(HttpResponseFormatConstructor, Format);
  Object.assign(HttpResponseFormatConstructor.prototype, {
    name: function() { return 'http-response'; },
    export: function() { return {'body': this.body}; },
  })
  return HttpResponseFormatConstructor
})()
