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
const { sendLogMessage } = require("../../util/logging");

module.exports = {
  name: "kick",
  description: "Kick a user from a ticket.",
  defaultMemberPermissions: BitwisePermissionFlags.ManageChannels.toString(),
  options: [
    {
      name: "user",
      description: "The user to kick.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "ticket",
      description: "The ticket where kick the user.",
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

    const channel = await client.getChannel(interaction.channelID);

    const permissionOverwrite = channel.permissionOverwrites.find(
      (permissionOverwrite) => permissionOverwrite.id === userID
    );

    if (
      permissionOverwrite &&
      !hasPermission(
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
            content: `${userMention(userID)} isn't in the ticket.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    client.editChannelPermissions(channelID, userID, {
      deny: String(
        BitwisePermissionFlags.ViewChannel +
          BitwisePermissionFlags.SendMessages +
          BitwisePermissionFlags.AttachFiles
      ),
      type: 1,
    });

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        content: `Kicked ${userMention(userID)} from ${channelMention(
          channelID
        )}.`,
        flags: MessageFlags.Ephemeral,
      },
    });

    const ticketChannel = await client.getChannel(channelID);

    sendLogMessage(client, interaction.guildID, "KICK", {
      ticketName: ticketChannel.name,
      ownerID: ticketData.ownerID,
      guiltyID: interaction.member.user.id,
      victimID: userID,
    });
  },
};
