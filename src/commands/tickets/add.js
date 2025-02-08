const {
  ApplicationCommandOptionType,
  ChannelTypes,
  Client,
  InteractionCallbackType,
  MessageFlags,
  channelMention,
  BitwisePermissionFlags,
  userMention,
} = require("disgroove");
const Ticket = require("../../models/Ticket");

module.exports = {
  name: "add",
  description: "Add a user to a ticket.",
  options: [
    {
      name: "user",
      description: "The user to add.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "ticket",
      description: "The ticket where add the user.",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelTypes.GuildText],
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   */
  run: async (client, interaction) => {
    const channelID = interaction.data.options.find(
      (option) => option.name === "ticket"
    )
      ? interaction.data.options.find((option) => option.name === "ticket")
          .value
      : interaction.channelID;

    const ticketData = await Ticket.findOne({
      guildID: interaction.guildID,
      channelID,
    }).catch(console.error);

    if (!ticketData)
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content: `${channelMention(channelID)} is not a ticket.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    const userID = interaction.data.options.find(
      (option) => option.name === "user"
    ).value;

    client.editChannelPermissions(channelID, userID, {
      allow:
        BitwisePermissionFlags.ViewChannel.toString() +
        BitwisePermissionFlags.SendMessages.toString() +
        BitwisePermissionFlags.AttachFiles.toString(),
      type: 1,
    });

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        content: `Added ${userMention(userID)} to ${channelMention(
          channelID
        )}.`,
        flags: MessageFlags.Ephemeral,
      },
    });
  },
};
