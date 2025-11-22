const {
  Client,
  InteractionType,
  ComponentTypes,
  ButtonStyles,
  InteractionCallbackType,
} = require("disgroove");
const Ticket = require("../../models/Ticket");
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
    if (interaction.data.customId !== "close") return;

    const ticketData = await Ticket.findOne({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    }).catch(console.error);

    if (!ticketData) return;

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.DeferredUpdateMessage,
    });

    client.editMessage(interaction.channelId, ticketData.messageId, {
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
              disabled: true,
            },
            {
              type: ComponentTypes.Button,
              style: ButtonStyles.Secondary,
              customId: "transcript",
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
        interaction.channelId,
        `Ticket closed by @${interaction.member.user.username}`
      );

      await Ticket.findOneAndDelete({
        guildId: interaction.guildId,
        channelId: interaction.channelId,
      });

      sendLogMessage(client, interaction.guildId, "CLOSE", {
        ticketName: interaction.channel.name,
        ownerId: ticketData.ownerId,
        guiltyId: interaction.member.user.id,
      });
    }, 5000);
  },
};
