const { model, Schema } = require("mongoose");

module.exports = model(
  "Panel",
  new Schema({
    guildID: String,
    channelID: String,
    messageID: String,
    panelID: String,
  })
);
