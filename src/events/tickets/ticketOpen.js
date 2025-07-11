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
    if (!interaction.data.customID.startsWith("open")) return;

    const panelID = interaction.data.customID.split(".")[1];

    const panelData = await Panel.findOne({
      guildID: interaction.guildID,
      panelID,
    }).catch(console.error);

    if (!panelData) return;

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

    const blacklistData = await Blacklist.findOne({
      guildID: interaction.guildID,
    }).catch(console.error);

    if (
      blacklistData &&
      (blacklistData.usersIDs.includes(interaction.member.user.id) ||
        blacklistData.rolesIDs.some((blacklistRoleID) =>
          interaction.member.roles.some((roleID) => roleID === blacklistRoleID)
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
        id: interaction.guildID,
        deny: String(BitwisePermissionFlags.ViewChannel),
        type: 0,
      },
    ];

    if (panelData.ticketAccessIDs && panelData.ticketAccessIDs.length !== 0)
      panelData.ticketAccessIDs.forEach((ticketAccessID) =>
        permissionOverwrites.push({
          id: ticketAccessID,
          allow: String(
            BitwisePermissionFlags.ViewChannel +
              BitwisePermissionFlags.SendMessages +
              BitwisePermissionFlags.AttachFiles
          ),
          type: 0,
        })
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
        permissionOverwrites,
        parentID: panelData.ticketsParentID ?? undefined,
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
              customID: "close",
              emoji: {
                id: null,
                name: "⛔",
              },
            },
            {
              type: ComponentTypes.Button,
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

    client.pinMessage(ticketChannel.id, ticketMessage.id);

    Ticket.create({
      guildID: interaction.guildID,
      channelID: ticketChannel.id,
      ownerID: interaction.member.user.id,
      messageID: ticketMessage.id,
      panelID,
    });

    sendLogMessage(client, interaction.guildID, "OPEN", {
      ticketName: ticketChannel.name,
      ownerID: interaction.member.user.id,
    });
  },
};
