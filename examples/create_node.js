const kumo = require("../dist");

const url = "ws://localhost:8080/";
const session = new kumo.Session()

console.info(`Connecting to the bridge on ${url}...`);
session.onConnect(async (context) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a Node...")
    const node = await context.createNode("test");

    let counter = 0;
    let subscription;

    console.info("Creating a Subscription...");
    subscription = await node.createSubscription(
      'std_msgs/msg/String', '/topic',
      async (message) => {
        console.info(`Received message: ${message}`);

        if (counter++ > 5) {
          if (subscription) {
            await subscription.destroy();
            console.warn("Subscription destroyed!");
          }
        }
      });
  })
  .onDisconnect((err) => {
    console.error(`Failed to connect to the bridge! ${err.message}`);
  })
  .connect(url);
