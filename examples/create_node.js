const kumo = require("../dist");

const url = "ws://localhost:8080/";
const session = new kumo.Session()

console.info(`Connecting to the bridge on ${url}...`);
session.onConnect((context) => {
    console.info(`Connected to the bridge!`);

    console.info("Creating a Node...");
    context.createNode("test")
      .then((node) => {
        console.info(`Node ${node.id} created!`)
      })
      .catch((err) => {
        console.error(err.message);
      });
  })
  .onDisconnect((err) => {
    console.error(`Failed to connect to the bridge! ${err.message}`);
  })
  .connect(url);
