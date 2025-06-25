const { model, Schema } = require("mongoose");

module.exports = model(
  "Blacklist",
  new Schema({
    guildID: String,
    usersIDs: Array,
    rolesIDs: Array,
  })
);
