const { Client } = require("disgroove");
const Ticket = require("../../models/Ticket");
const Logging = require("../../models/Logging");
const Panel = require("../../models/Panel");

module.exports = {
  name: "channelDelete",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Channel} channel
   */
  run: async (client, channel) => {
    const ticketData = await Ticket.findOne({
      guildID: channel.guildID,
      channelID: channel.id,
    }).catch(console.error);

    if (ticketData) {
      await Ticket.findOneAndDelete({
        guildID: channel.guildID,
        channelID: channel.id,
      });
    }

    const loggingData = await Logging.findOne({
      guildID: channel.guildID,
      channelID: channel.id,
    }).catch(console.error);

    if (loggingData) {
      await Logging.findOneAndUpdate(
        {
          guildID: channel.guildID,
          channelID: channel.id,
        },
        {
          $set: {
            channelID: null,
          },
        }
      );
    }

    const panelData = await Panel.findOne({
      guildID: channel.guildID,
      channelID: channel.id,
    });

    if (panelData) {
      await Panel.findOneAndDelete({
        guildID: channel.guildID,
        channelID: channel.id,
      });
    }
  },
};
