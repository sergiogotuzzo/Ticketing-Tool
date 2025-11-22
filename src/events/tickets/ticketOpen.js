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
  userMention,
} = require("disgroove");
const Ticket = require("../../models/Ticket");
const { sendLogMessage } = require("../../util/logging");
const Panel = require("../../models/Panel");
const Blacklist = require("../../models/Blacklist");

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
    if (!interaction.data.customId.startsWith("open")) return;

    const panelId = interaction.data.customId.split(".")[1];

    const panelData = await Panel.findOne({
      guildId: interaction.guildId,
      panelId,
    }).catch(console.error);

    if (!panelData) return;

    const ticketData = await Ticket.findOne({
      guildId: interaction.guildId,
      ownerId: interaction.member.user.id,
      panelId,
    }).catch(console.error);

    if (ticketData)
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content: `Ticket already opened at ${channelMention(
              ticketData.channelId
            )}.`,
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    const blacklistData = await Blacklist.findOne({
      guildId: interaction.guildId,
    }).catch(console.error);

    if (
      blacklistData &&
      (blacklistData.usersIds.includes(interaction.member.user.id) ||
        blacklistData.rolesIds.some((blacklistRoleId) =>
          interaction.member.roles.some((roleId) => roleId === blacklistRoleId)
        ))
    )
      return client.createInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
            content:
              "You cannot open a ticket because you are in the blacklist.",
            flags: MessageFlags.Ephemeral,
          },
        }
      );

    const permissionOverwrites = [
      {
        id: client.user.id,
        allow: String(
          BitwisePermissionFlags.ViewChannel +
            BitwisePermissionFlags.SendMessages +
            BitwisePermissionFlags.AttachFiles
        ),
        type: 1,
      },
      {
        id: interaction.member.user.id,
        allow: String(
          BitwisePermissionFlags.ViewChannel +
            BitwisePermissionFlags.SendMessages +
            BitwisePermissionFlags.AttachFiles
        ),
        type: 1,
      },
      {
        id: interaction.guildId,
        deny: String(BitwisePermissionFlags.ViewChannel),
        type: 0,
      },
    ];

    if (panelData.ticketAccessIds && panelData.ticketAccessIds.length !== 0)
      panelData.ticketAccessIds.forEach((ticketAccessId) =>
        permissionOverwrites.push({
          id: ticketAccessId,
          allow: String(
            BitwisePermissionFlags.ViewChannel +
              BitwisePermissionFlags.SendMessages +
              BitwisePermissionFlags.AttachFiles
          ),
          type: 0,
        })
      );

    const ticketChannel = await client.createChannel(
      interaction.guildId,
      {
        name: `ticket-${interaction.member.user.username}`,
        type: ChannelTypes.GuildText,
        topic: `Ticket opened by @${
          interaction.member.user.username
        } ${unixTimestamp(
          Math.floor(Date.now() / 1000.0),
          TimestampStyles.RelativeTime
        )}`,
        permissionOverwrites,
        parentId: panelData.ticketsParentId ?? undefined,
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
          title: `${interaction.member.user.username}'s ticket`,
          description:
            "⛔: **To close this ticket**\n📑: **To save the transcript of this ticket**",
          color: 5793266,
        },
      ],
      components: [
        {
          type: ComponentTypes.ActionRow,
          components: [
            {
              type: ComponentTypes.Button,
              style: ButtonStyles.Danger,
              customId: "close",
              emoji: {
                id: null,
                name: "⛔",
              },
            },
            {
              type: ComponentTypes.Button,
              style: ButtonStyles.Secondary,
              customId: "transcript",
              emoji: {
                id: null,
                name: "📑",
              },
            },
          ],
        },
      ],
    });

    client.pinMessage(ticketChannel.id, ticketMessage.id);

    Ticket.create({
      guildId: interaction.guildId,
      channelId: ticketChannel.id,
      ownerId: interaction.member.user.id,
      messageId: ticketMessage.id,
      panelId,
    });

    sendLogMessage(client, interaction.guildId, "OPEN", {
      ticketName: ticketChannel.name,
      ownerId: interaction.member.user.id,
    });

    const mentionMessage = await client.createMessage(ticketChannel.id, {
      content: `${userMention(interaction.member.user.id)}`,
    });

    setTimeout(
      () => client.deleteMessage(mentionMessage.channelId, mentionMessage.id),
      0
    );
  },
};
