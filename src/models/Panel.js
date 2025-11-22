const { model, Schema } = require("mongoose");

module.exports = model(
  "Panel",
  new Schema({
    guildId: String,
    channelId: String,
    messageId: String,
    panelId: String,
    ticketsParentId: String,
    ticketAccessIds: Array,
  })
);
