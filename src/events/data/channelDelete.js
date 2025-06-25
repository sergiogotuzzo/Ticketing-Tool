const { Client } = require("disgroove");
const Ticket = require("../../models/Ticket");
const Logging = require("../../models/Logging");

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

    if (!ticketData) return;

    await Ticket.findOneAndDelete({
      guildID: channel.guildID,
      channelID: channel.id,
    });

    const loggingData = await Logging.findOne({
      guildID: channel.guildID,
      channelID: channel.id,
    }).catch(console.error);

    if (!loggingData) return;

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
  },
};
