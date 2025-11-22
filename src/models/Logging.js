const { model, Schema } = require("mongoose");

module.exports = model(
  "Logging",
  new Schema({
    guildId: String,
    channelId: String,
    actions: Array,
  })
);
