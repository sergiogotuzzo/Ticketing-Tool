const {
  Client,
  InteractionType,
  ComponentTypes,
  ButtonStyles,
  InteractionCallbackType,
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
              label: "In closing...",
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
              label: "Transcript",
              style: ButtonStyles.Secondary,
              customID: "transcript",
              emoji: {
                id: null,
                name: "📑",
              },
              disabled: true,
            },
            {
              type: ComponentTypes.Button,
              label: "Unlock",
              style: ButtonStyles.Success,
              customID: "unlock",
              emoji: {
                id: null,
                name: "🔓",
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
        `Ticket closed by @${interaction.member.user.globalName}`
      );

      await Ticket.findOneAndDelete({
        guildID: interaction.guildID,
        channelID: interaction.channelID,
      });
    }, 5000);
  },
};
