const kumo = require("../dist");

const url = "ws://localhost:8080/";
const bridge = new kumo.Bridge();

console.info(`Connecting to the bridge on ${url}...`);
bridge
  .onConnect(async (session) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a node...");
    const node = await session.createNode("simple_subscription");

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
  .onDisconnect((code, reason) => {
    console.error(`Disconnected from the bridge! ${reason} (${code})`);
  })
  .onError((err) => {
    console.error(`Found error! ${err.message}`);
  })
  .connect(url);
