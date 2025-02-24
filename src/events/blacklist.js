const {
  Client,
  InteractionType,
  ComponentTypes,
  InteractionCallbackType,
} = require("disgroove");
const Config = require("../models/Config");

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
      const configData = await Config.findOne({
        guildID: interaction.guildID,
      }).catch(console.error);

      if (!configData)
        Config.create({
          guildID: interaction.guildID,
          loggingChannelID: null,
          loggingActions: [],
          blacklistUsersIDs: [],
          blacklistRolesIDs: [],
        });

      await Config.findOneAndUpdate(
        {
          guildID: interaction.guildID,
        },
        {
          $set: {
            blacklistUsersIDs: interaction.data.values,
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
      const configData = await Config.findOne({
        guildID: interaction.guildID,
      }).catch(console.error);

      if (!configData)
        Config.create({
          guildID: interaction.guildID,
          loggingChannelID: null,
          loggingActions: [],
          blacklistUsersIDs: [],
          blacklistRolesIDs: [],
        });

      await Config.findOneAndUpdate(
        {
          guildID: interaction.guildID,
        },
        {
          $set: {
            blacklistRolesIDs: interaction.data.values,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    }
  },
};
