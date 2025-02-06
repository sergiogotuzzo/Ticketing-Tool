const { model, Schema } = require("mongoose");

module.exports = model(
  "Ticket",
  new Schema({
    guildID: String,
    channelID: String,
    ownerID: String,
    messageID: String,
    panelID: String,
  })
);
