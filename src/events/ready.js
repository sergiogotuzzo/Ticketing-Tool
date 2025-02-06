const { Client } = require("disgroove");

module.exports = {
  name: "ready",
  /**
   *
   * @param {Client} client
   */
  run: (client) => {
    console.log("Online!");

    client.bulkEditGlobalApplicationCommands(client.user.id, client.commands);
  },
};
