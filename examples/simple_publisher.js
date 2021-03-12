const kumo = require("../dist");

const url = "ws://localhost:8080/";
const session = new kumo.Session();

console.info(`Connecting to the bridge on ${url}...`);
session
  .onConnect(async (context) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a node...");
    const node = await context.createNode("simple_publisher");

    console.info("Creating a publisher...");
    const publisher = await node.createPublisher(
      "std_msgs/msg/String",
      "/topic"
    );

    for (let i = 0; i < 10; ++i) {
      const message = { data: `Hello, world! ${i}` };

      console.info(`Publishing: ${message.data}`);
      await publisher.publish(message);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await publisher.destroy();
    console.warn("Publisher destroyed!");

    await node.destroy();
    console.warn("Node destroyed!");

    process.exit(0);
  })
  .onDisconnect((err) => {
    console.error(`Failed to connect to the bridge! ${err.message}`);
  })
  .connect(url);
