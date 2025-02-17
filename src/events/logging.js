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
      interaction.data.componentType === ComponentTypes.ChannelSelect &&
      interaction.data.customID === "logging.channel.set"
    ) {
      const configData = await Config.findOne({
        guildID: interaction.guildID,
      }).catch(console.error);

      if (!configData)
        Config.create({
          guildID: interaction.guildID,
          loggingChannelID: null,
          loggingActions: [],
        });

      await Config.findOneAndUpdate(
        {
          guildID: interaction.guildID,
        },
        {
          $set: {
            loggingChannelID: interaction.data.values[0] ?? null,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    } else if (
      interaction.data.componentType === ComponentTypes.StringSelect &&
      interaction.data.customID === "logging.actions.set"
    ) {
      const configData = await Config.findOne({
        guildID: interaction.guildID,
      }).catch(console.error);

      if (!configData)
        Config.create({
          guildID: interaction.guildID,
          loggingChannelID: null,
          loggingActions: [],
        });

      await Config.findOneAndUpdate(
        {
          guildID: interaction.guildID,
        },
        {
          $set: {
            loggingActions: interaction.data.values,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    }
  },
};
