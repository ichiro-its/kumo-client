const kumo = require("../dist");

const url = "ws://localhost:8080/";
const bridge = new kumo.Bridge();

console.info(`Connecting to the bridge on ${url}...`);
bridge
  .onConnect(async (session) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a node...");
    const node = await session.createNode("simple_publisher");

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
  .onDisconnect((code, reason) => {
    console.error(`Disconnected from the bridge! ${reason} (${code})`);
  })
  .onError((err) => {
    console.error(`Found error! ${err.message}`);
  })
  .connect(url);
