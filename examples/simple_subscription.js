const kumo = require("../dist");

const url = "ws://localhost:8080/";
const session = new kumo.Session();

console.info(`Connecting to the bridge on ${url}...`);
session
  .onConnect(async (context) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a node...");
    const node = await context.createNode("simple_subscription");

    let counter = 0;

    console.info("Creating a subscription...");
    const subscription = await node.createSubscription(
      "std_msgs/msg/String",
      "/topic",
      async (message) => {
        console.info(`I heard: ${message.data}`);

        if (++counter >= 5) {
          await subscription.destroy();
          console.warn("Subscription destroyed!");

          await node.destroy();
          console.warn("Node destroyed!");

          process.exit(0);
        }
      }
    );
  })
  .onDisconnect((err) => {
    console.error(`Failed to connect to the bridge! ${err.message}`);
  })
  .connect(url);
