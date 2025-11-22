const { Client, ButtonStyles, ComponentTypes } = require("disgroove");
const Ticket = require("../../models/Ticket");
const Panel = require("../../models/Panel");

module.exports = {
  name: "messageDelete",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").MessageDeleteEventFields} message
   */
  run: async (client, message) => {
    const ticketData = await Ticket.findOne({
      guildId: message.guildId,
      messageId: message.id,
    }).catch(console.error);

    if (ticketData) {
      const ticketOwner = await client.getUser(ticketData.ownerId);
      const ticketMessage = await client.createMessage(ticketData.channelId, {
        embeds: [
          {
            title: `${ticketOwner.username}'s ticket`,
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

      client.pinMessage(ticketData.channelId, ticketMessage.id);

      await Ticket.findOneAndUpdate(
        {
          guildId: message.guildId,
          messageId: message.id,
        },
        {
          $set: {
            messageId: ticketMessage.id,
          },
        }
      );
    }

    const panelData = await Panel.findOne({
      guildId: message.guildId,
      channelId: message.channelId,
      messageId: message.id,
    });

    if (panelData) {
      await Panel.findOneAndDelete({
        guildId: message.guildId,
        channelId: message.channelId,
        messageId: message.id,
      });
    }
  },
};
