const {
  Client,
  InteractionType,
  ComponentTypes,
  channelMention,
  MessageFlags,
  InteractionCallbackType,
  ChannelTypes,
  BitwisePermissionFlags,
  ButtonStyles,
  unixTimestamp,
  TimestampStyles,
} = require("disgroove");
const Ticket = require("../../models/Ticket");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    if (
      interaction.type !== InteractionType.MessageComponent &&
      interaction.data.componentType !== ComponentTypes.Button
    )
      return;

    if (!interaction.data.customID.startsWith("open")) return;

    const panelID = interaction.data.customID.split(".")[1];

    const ticketData = await Ticket.findOne({
      guildID: interaction.guildID,
      ownerID: interaction.member.user.id,
      panelID,
    }).catch(console.error);

    if (ticketData)
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content: `Ticket already opened at ${channelMention(
              ticketData.channelID
            )}.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    const ticketChannel = await client.createChannel(
      interaction.guildID,
      {
        name: `ticket-${interaction.member.user.username}`,
        type: ChannelTypes.GuildText,
        topic: `Ticket opened by @${
          interaction.member.user.username
        } ${unixTimestamp(
          Math.floor(Date.now() / 1000.0),
          TimestampStyles.RelativeTime
        )}`,
        permissionOverwrites: [
          {
            id: client.user.id,
            allow: String(
              BitwisePermissionFlags.ViewChannel +
                BitwisePermissionFlags.SendMessages +
                BitwisePermissionFlags.AttachFiles
            ),
          },
          {
            id: interaction.member.user.id,
            allow: String(
              BitwisePermissionFlags.ViewChannel +
                BitwisePermissionFlags.SendMessages +
                BitwisePermissionFlags.AttachFiles
            ),
          },
          {
            id: interaction.guildID,
            deny: String(BitwisePermissionFlags.ViewChannel),
          },
        ],
      },
      `Ticket opened by @${interaction.member.user.username}.`
    );

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        content: `Ticket opened at ${channelMention(ticketChannel.id)}.`,
        flags: MessageFlags.Ephemeral,
      },
    });

    const ticketMessage = await client.createMessage(ticketChannel.id, {
      embeds: [
        {
          title: "Support",
          description: "In this ticket you can ask help.",
          color: 5793266,
        },
      ],
      components: [
        {
          type: ComponentTypes.ActionRow,
          components: [
            {
              type: ComponentTypes.Button,
              label: "Close",
              style: ButtonStyles.Danger,
              customID: "close",
              emoji: {
                id: null,
                name: "⛔",
              },
            },
            {
              type: ComponentTypes.Button,
              label: "Transcript",
              style: ButtonStyles.Secondary,
              customID: "transcript",
              emoji: {
                id: null,
                name: "📑",
              },
            },
          ],
        },
      ],
    });

    Ticket.create({
      guildID: interaction.guildID,
      channelID: ticketChannel.id,
      ownerID: interaction.member.user.id,
      messageID: ticketMessage.id,
      panelID,
    });
  },
};
