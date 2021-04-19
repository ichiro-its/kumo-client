const kumo = require("../dist");

const url = "ws://localhost:8080/";
const bridge = new kumo.Bridge();

console.info(`Connecting to the bridge on ${url}...`);
bridge
  .onConnect(() => {
    console.info(`Connected to the bridge!`);
  })
  .onDisconnect((code, reason) => {
    console.error(`Disconnected from the bridge! ${reason} (${code})`);
  })
  .onError((err) => {
    console.error(`Found error! ${err.message}`);
  })
  .connect(url)
  .then(async (session) => {
    console.info("Creating a node...");
    const node = await session.createNode("simple_service");

    let counter = 0;

    console.info("Creating a service...");
    const service = await node.createService(
      "example_interfaces/srv/AddTwoInts",
      "/add_two_ints",
      async (request) => {
        if (++counter >= 10) {
          await service.destroy();
          console.warn("Service destroyed!");

          await node.destroy();
          console.warn("Node destroyed!");

          process.exit(0);
        }

        console.info(`Handling: ${request.a} + ${request.b}`);

        return { sum: request.a + request.b };
      }
    );
  })
  .catch((err) => {
    console.error(`Failed to connect to the bridge! ${err.message}`);
  });
