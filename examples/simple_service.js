const kumo = require("../dist");

const url = "ws://localhost:8080/";
const session = new kumo.Session();

console.info(`Connecting to the bridge on ${url}...`);
session
  .onConnect(async (context) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a node...");
    const node = await context.createNode("simple_client");

    console.info("Creating a service...");
    await node.createService(
      "example_interfaces/srv/AddTwoInts",
      "/add_two_ints"
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await node.destroy();
    console.warn("Node destroyed!");

    process.exit(0);
  })
  .onDisconnect((err) => {
    console.error(`Failed to connect to the bridge! ${err.message}`);
  })
  .connect(url);
