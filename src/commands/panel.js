const {
  ApplicationCommandOptionType,
  ChannelTypes,
  Client,
  InteractionCallbackType,
  MessageFlags,
  ComponentTypes,
  ButtonStyles,
} = require("disgroove");
const Panel = require("../models/Panel");

module.exports = {
  name: "panel",
  description: "Manage a panel.",
  options: [
    {
      name: "create",
      description: "Create a panel.",
      type: ApplicationCommandOptionType.SubCommand,
      options: [
        {
          name: "channel",
          description: "The channel where create the panel.",
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelTypes.GuildText],
        },
        {
          name: "id",
          description: "The ID of the panel.",
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete a panel.",
      type: ApplicationCommandOptionType.SubCommand,
      options: [
        {
          name: "id",
          description: "The ID of the panel.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   */
  run: async (client, interaction) => {
    const subCommand = interaction.data.options.find(
      (option) => option.type === ApplicationCommandOptionType.SubCommand
    );

    if (subCommand.name === "create") {
      const channelID = subCommand.options.find(
        (option) => option.name === "channel"
      )
        ? subCommand.options.find((option) => option.name === "channel").value
        : interaction.channelID;
      const panelID = subCommand.options.find((option) => option.name === "id")
        ? subCommand.options.find((option) => option.name === "id").value
        : Math.random().toString(16).slice(2);

      const panel = await Panel.findOne({
        guildID: interaction.guildID,
        channelID: interaction.channelID,
        panelID,
      }).catch(console.error);

      if (panel)
        return client.createInteractionResponse(
          interaction.id,
          interaction.token,
          {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              content: `Panel \`${panelID}\` already existing at https://discord.com/channels/${interaction.guildID}/${interaction.channelID}/${panel.messageID}.`,
              flags: MessageFlags.Ephemeral,
            },
          }
        );

      const message = await client.createMessage(channelID, {
        embeds: [
          {
            title: "Support",
            description: 'Click "Open" to create a ticket.',
            color: 5793266,
          },
        ],
        components: [
          {
            type: ComponentTypes.ActionRow,
            components: [
              {
                type: ComponentTypes.Button,
                label: "Open",
                style: ButtonStyles.Primary,
                customID: `open.${panelID}`,
                emoji: {
                  id: null,
                  name: "📩",
                },
              },
            ],
          },
        ],
      });

      Panel.create({
        guildID: interaction.guildID,
        channelID: interaction.channelID,
        messageID: message.id,
        panelID,
      });

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: {
          content: `Panel \`${panelID}\` successfully created at https://discord.com/channels/${interaction.guildID}/${interaction.channelID}/${message.id}.`,
          flags: MessageFlags.Ephemeral,
        },
      });
    } else if (subCommand.name === "delete") {
      const panelID = subCommand.options.find(
        (option) => option.name === "id"
      ).value;

      const panel = await Panel.findOne({
        guildID: interaction.guildID,
        panelID,
      }).catch(console.error);

      if (!panel)
        return client.createInteractionResponse(
          interaction.id,
          interaction.token,
          {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              content: `No existing \`${panelID}\` panel.`,
              flags: MessageFlags.Ephemeral,
            },
          }
        );

      client.deleteMessage(panel.channelID, panel.messageID);

      await Panel.findOneAndDelete({
        guildID: interaction.guildID,
        panelID,
      });

      client.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: {
          content: `Panel \`${panelID}\` successfully deleted.`,
          flags: MessageFlags.Ephemeral,
        },
      });
    }
  },
};
