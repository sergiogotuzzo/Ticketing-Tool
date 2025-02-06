const { Client, InteractionType } = require("disgroove");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   * @returns
   */
  run: (client, interaction) => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const command = client.commands.find(
      (cmd) => cmd.name === interaction.data.name
    );

    if (!command) return;

    command.run(client, interaction);
  },
};
