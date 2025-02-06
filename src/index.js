const { Client, GatewayIntents } = require("disgroove");
const { getFiles } = require("./util/handler");
const mongo = require("mongoose");
const { BOT_TOKEN, MONGODB_URI } = require("../secret.json");

const client = new Client(BOT_TOKEN, {
  gateway: {
    intents: GatewayIntents.All,
  },
});

client.commands = getFiles(`${process.cwd()}/src/commands`);
client.events = getFiles(`${process.cwd()}/src/events`);

client.events.forEach((event) =>
  client.on(event.name, (...args) => event.run(client, ...args))
);

client.connect();
mongo.connect(MONGODB_URI);
