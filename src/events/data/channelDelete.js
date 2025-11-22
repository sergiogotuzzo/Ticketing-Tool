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
      guildId: channel.guildId,
      channelId: channel.id,
    }).catch(console.error);

    if (ticketData) {
      await Ticket.findOneAndDelete({
        guildId: channel.guildId,
        channelId: channel.id,
      });
    }

    const loggingData = await Logging.findOne({
      guildId: channel.guildId,
      channelId: channel.id,
    }).catch(console.error);

    if (loggingData) {
      await Logging.findOneAndUpdate(
        {
          guildId: channel.guildId,
          channelId: channel.id,
        },
        {
          $set: {
            channelId: null,
          },
        }
      );
    }

    const panelData = await Panel.findOne({
      guildId: channel.guildId,
      channelId: channel.id,
    });

    if (panelData) {
      await Panel.findOneAndDelete({
        guildId: channel.guildId,
        channelId: channel.id,
      });
    }
  },
};
