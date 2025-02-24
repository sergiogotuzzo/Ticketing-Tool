const {
  Client,
  InteractionType,
  ComponentTypes,
  ButtonStyles,
  InteractionCallbackType,
  userMention,
} = require("disgroove");
const Ticket = require("../../models/Ticket");
const Config = require("../../models/Config");
const { sendLogMessage } = require("../../util/logging");

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

    if (interaction.data.customID !== "close") return;

    const ticketData = await Ticket.findOne({
      guildID: interaction.guildID,
      channelID: interaction.channelID,
    }).catch(console.error);

    if (!ticketData) return;

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.DeferredUpdateMessage,
    });

    client.editMessage(interaction.channelID, ticketData.messageID, {
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
              disabled: true,
            },
            {
              type: ComponentTypes.Button,
              style: ButtonStyles.Secondary,
              customID: "transcript",
              emoji: {
                id: null,
                name: "📑",
              },
              disabled: true,
            },
          ],
        },
      ],
    });

    setTimeout(async () => {
      client.deleteChannel(
        interaction.channelID,
        `Ticket closed by @${interaction.member.user.username}`
      );

      await Ticket.findOneAndDelete({
        guildID: interaction.guildID,
        channelID: interaction.channelID,
      });

      sendLogMessage(client, interaction.guildID, "CLOSE", {
        ticketName: interaction.channel.name,
        ownerID: ticketData.ownerID,
        guiltyID: interaction.member.user.id,
      });
    }, 5000);
  },
};
