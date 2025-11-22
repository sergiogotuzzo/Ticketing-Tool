const {
  Client,
  InteractionType,
  ComponentTypes,
  InteractionCallbackType,
} = require("disgroove");
const Logging = require("../models/Logging");

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
      interaction.data.customId === "logging.channel.set"
    ) {
      const loggingData = await Logging.findOne({
        guildId: interaction.guildId,
      }).catch(console.error);

      if (!loggingData) return;

      await Logging.findOneAndUpdate(
        {
          guildId: interaction.guildId,
        },
        {
          $set: {
            channelId: interaction.data.values[0] ?? null,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    } else if (
      interaction.data.componentType === ComponentTypes.StringSelect &&
      interaction.data.customId === "logging.actions.set"
    ) {
      const loggingData = await Logging.findOne({
        guildId: interaction.guildId,
      }).catch(console.error);

      if (!loggingData) return;

      await Logging.findOneAndUpdate(
        {
          guildId: interaction.guildId,
        },
        {
          $set: {
            actions: interaction.data.values,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    }
  },
};
