const kumo = require("../dist");

const url = "ws://localhost:8080/";
const bridge = new kumo.Bridge();

console.info(`Connecting to the bridge on ${url}...`);
bridge
  .onConnect(async (session) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a node...");
    const node = await session.createNode("simple_client");

    console.info("Creating a client...");
    const client = await node.createClient(
      "example_interfaces/srv/AddTwoInts",
      "/add_two_ints"
    );

    for (let i = 0; i < 5; ++i) {
      const request = {
        a: Math.floor(Math.random() * 10),
        b: Math.floor(Math.random() * 10),
      };

      console.info(`Requesting: ${request.a} ${request.b}`);
      const result = await client.call(request);

      console.info(`Result of ${request.a} + ${request.b} = ${result.sum}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await client.destroy();
    console.warn("Client destroyed!");

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
