const { model, Schema } = require("mongoose");

module.exports = model(
  "Blacklist",
  new Schema({
    guildId: String,
    usersIds: Array,
    rolesIds: Array,
  })
);
