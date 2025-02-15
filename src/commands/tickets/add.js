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
const { hasPermission } = require("../../util/permissions");
const { sendLogMessage } = require("../../util/logging");

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
    if (
      !hasPermission(
        interaction.member.permissions,
        BitwisePermissionFlags.ManageChannels
      )
    )
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content: "You don't have `Manage Channels` permission.",
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    const userID = interaction.data.options.find(
      (option) => option.name === "user"
    ).value;

    const channel = await client.getChannel(interaction.channelID);

    const permissionOverwrite = channel.permissionOverwrites.find(
      (permissionOverwrite) => permissionOverwrite.id === userID
    );

    if (
      permissionOverwrite &&
      hasPermission(
        permissionOverwrite.allow,
        BitwisePermissionFlags.ViewChannel
      )
    )
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content: `${userMention(userID)} is already in the ticket.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    client.editChannelPermissions(channelID, userID, {
      allow: String(
        BitwisePermissionFlags.ViewChannel +
          BitwisePermissionFlags.SendMessages +
          BitwisePermissionFlags.AttachFiles
      ),
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

    const ticketChannel = await client.getChannel(channelID);

    sendLogMessage(client, interaction.guildID, "ADD", {
      ticketName: ticketChannel.name,
      ownerID: ticketData.ownerID,
      guiltyID: interaction.member.user.id,
      victimID: userID,
    });
  },
};
