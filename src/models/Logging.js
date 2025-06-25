const { model, Schema } = require("mongoose");

module.exports = model(
  "Logging",
  new Schema({
    guildID: String,
    channelID: String,
    actions: Array,
  })
);
