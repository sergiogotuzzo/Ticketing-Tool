const { model, Schema } = require("mongoose");

module.exports = model(
  "Ticket",
  new Schema({
    guildId: String,
    channelId: String,
    ownerId: String,
    messageId: String,
    panelId: String,
  })
);
