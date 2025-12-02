const {
  Client,
  InteractionCallbackType,
  MessageFlags,
  BitwisePermissionFlags,
  ApplicationCommandOptionType,
  userMention,
  roleMention,
} = require("disgroove");

module.exports = {
  name: "help",
  description: "List of bot's commands",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   */
  run: async (client, interaction) => {
    client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: {
            content: (await client.getGlobalApplicationCommands(client.application.id)).join("\n")
        }
    })
  },
};
