const {
  Client,
  InteractionType,
  ComponentTypes,
  InteractionCallbackType,
} = require("disgroove");
const Panel = require("../models/Panel");

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
      interaction.data.customID.startsWith("panel") &&
      interaction.data.customID.endsWith("ticketsParent.set")
    ) {
      const panelID = interaction.data.customID.split(".")[1];

      const panelData = await Panel.findOne({
        guildID: interaction.guildID,
        panelID,
      }).catch(console.error);

      if (!panelData) return;

      await Panel.findOneAndUpdate(
        {
          guildID: interaction.guildID,
          panelID,
        },
        {
          $set: {
            ticketsParentID: interaction.data.values[0],
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    } else if (
      interaction.data.componentType === ComponentTypes.RoleSelect &&
      interaction.data.customID.startsWith("panel") &&
      interaction.data.customID.endsWith("ticketAccess.set")
    ) {
      const panelID = interaction.data.customID.split(".")[1];

      const panelData = await Panel.findOne({
        guildID: interaction.guildID,
        panelID,
      }).catch(console.error);

      if (!panelData) return;

      await Panel.findOneAndUpdate(
        {
          guildID: interaction.guildID,
          panelID,
        },
        {
          $set: {
            ticketAccessIDs: interaction.data.values,
          },
        }
      );

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.DeferredUpdateMessage,
      });
    }
  },
};
