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
    const channelId = interaction.data.options.find(
      (option) => option.name === "ticket"
    )
      ? interaction.data.options.find((option) => option.name === "ticket")
          .value
      : interaction.channelId;

    const ticketData = await Ticket.findOne({
      guildId: interaction.guildId,
      channelId,
    }).catch(console.error);

    if (!ticketData)
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content: `${channelMention(channelId)} is not a ticket.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    const userId = interaction.data.options.find(
      (option) => option.name === "user"
    ).value;

    const channel = await client.getChannel(interaction.channelId);

    const permissionOverwrite = channel.permissionOverwrites.find(
      (permissionOverwrite) => permissionOverwrite.id === userId
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
            content: `${userMention(userId)} isn't in the ticket.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    client.editChannelPermissions(channelId, userId, {
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
        content: `Kicked ${userMention(userId)} from ${channelMention(
          channelId
        )}.`,
        flags: MessageFlags.Ephemeral,
      },
    });

    const ticketChannel = await client.getChannel(channelId);

    sendLogMessage(client, interaction.guildId, "KICK", {
      ticketName: ticketChannel.name,
      ownerId: ticketData.ownerId,
      guiltyId: interaction.member.user.id,
      victimId: userId,
    });
  },
};
