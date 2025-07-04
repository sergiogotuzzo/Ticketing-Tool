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
      guildID: message.guildID,
      messageID: message.id,
    }).catch(console.error);

    if (ticketData) {
      const ticketOwner = await client.getUser(ticketData.ownerID);
      const ticketMessage = await client.createMessage(ticketData.channelID, {
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

      client.pinMessage(ticketData.channelID, ticketMessage.id);

      await Ticket.findOneAndUpdate(
        {
          guildID: message.guildID,
          messageID: message.id,
        },
        {
          $set: {
            messageID: ticketMessage.id,
          },
        }
      );
    }

    const panelData = await Panel.findOne({
      guildID: message.guildID,
      channelID: message.channelID,
      messageID: message.id,
    });

    if (panelData) {
      await Panel.findOneAndDelete({
        guildID: message.guildID,
        channelID: message.channelID,
        messageID: message.id,
      });
    }
  },
};
