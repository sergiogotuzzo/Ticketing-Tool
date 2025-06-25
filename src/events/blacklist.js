const {
  Client,
  InteractionType,
  ComponentTypes,
  InteractionCallbackType,
} = require("disgroove");
const Blacklist = require("../models/Blacklist");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    if (interaction.type !== InteractionType.MessageComponent) return;

    if (
      interaction.data.componentType === ComponentTypes.UserSelect &&
      interaction.data.customID === "blacklist.users.set"
    ) {
      const blacklistData = await Blacklist.findOne({
        guildID: interaction.guildID,
      }).catch(console.error);

      if (!blacklistData) return;

      await Blacklist.findOneAndUpdate(
        {
          guildID: interaction.guildID,
        },
        {
          $set: {
            usersIDs: interaction.data.values,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    } else if (
      interaction.data.componentType === ComponentTypes.RoleSelect &&
      interaction.data.customID === "blacklist.roles.set"
    ) {
      const blacklistData = await Blacklist.findOne({
        guildID: interaction.guildID,
      }).catch(console.error);

      if (!blacklistData) return;

      await Blacklist.findOneAndUpdate(
        {
          guildID: interaction.guildID,
        },
        {
          $set: {
            rolesIDs: interaction.data.values,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    }
  },
};
