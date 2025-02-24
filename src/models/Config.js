const { model, Schema } = require("mongoose");

module.exports = model(
  "Config",
  new Schema({
    guildID: String,
    loggingChannelID: String,
    loggingActions: Array,
    blacklistUsersIDs: Array,
    blacklistRolesIDs: Array,
  })
);
