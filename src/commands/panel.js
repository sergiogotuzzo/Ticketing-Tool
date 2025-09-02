const {
  ApplicationCommandOptionType,
  ChannelTypes,
  Client,
  InteractionCallbackType,
  MessageFlags,
  ComponentTypes,
  ButtonStyles,
  BitwisePermissionFlags,
} = require("disgroove");
const Panel = require("../models/Panel");

module.exports = {
  name: "panel",
  description: "Manage a panel.",
  defaultMemberPermissions: BitwisePermissionFlags.ManageChannels.toString(),
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
    {
      name: "id",
      description: "Get the ID of a panel.",
      type: ApplicationCommandOptionType.SubCommand,
      options: [
        {
          name: "link",
          description: "The link of the panel message.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "manage",
      description: "Manage a panel.",
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
    {
      name: "customize",
      description: "Customize a panel.",
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

    switch (subCommand.name) {
      case "create":
        {
          const channelID = subCommand.options.find(
            (option) => option.name === "channel"
          )
            ? subCommand.options.find((option) => option.name === "channel")
                .value
            : interaction.channelID;
          const panelID = subCommand.options.find(
            (option) => option.name === "id"
          )
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
                    customID: `open.${panelID}.0`,
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
        }
        break;
      case "delete":
        {
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
        break;
      case "id":
        {
          const link = subCommand.options.find(
            (option) => option.name === "link"
          ).value;

          try {
            const messageID = new URL(link).pathname.split("/")[4];

            const panel = await Panel.findOne({
              guildID: interaction.guildID,
              messageID,
            }).catch(console.error);

            if (!panel)
              return client.createInteractionResponse(
                interaction.id,
                interaction.token,
                {
                  type: InteractionCallbackType.ChannelMessageWithSource,
                  data: {
                    content: `${link} is not a panel.`,
                    flags: MessageFlags.Ephemeral,
                  },
                }
              );

            client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: `The ID of ${link} is \`${panel.panelID}\`.`,
                  flags: MessageFlags.Ephemeral,
                },
              }
            );
          } catch {
            client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: `${link} is not a panel.`,
                  flags: MessageFlags.Ephemeral,
                },
              }
            );
          }
        }
        break;
      case "manage":
        {
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

          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              embeds: [
                {
                  color: 11184810,
                  title: `\`${panelID}\` management`,
                  description:
                    "The ticket category is the category in which all tickets will be created.\nThe support roles are the roles that will have immediate access to each ticket.\n\nBoth can be chosen via the drop-down menus below.",
                },
              ],
              components: [
                {
                  type: ComponentTypes.ActionRow,
                  components: [
                    {
                      type: ComponentTypes.ChannelSelect,
                      customID: `${panelID}.tickets-parent.set`,
                      channelTypes: [ChannelTypes.GuildCategory],
                      placeholder: "Select the ticket's category",
                      defaultValues: panel.ticketsParentID
                        ? [
                            {
                              id: panel.ticketsParentID,
                              type: "channel",
                            },
                          ]
                        : undefined,
                      minValues: 0,
                      maxValues: 1,
                    },
                  ],
                },
                {
                  type: ComponentTypes.ActionRow,
                  components: [
                    {
                      type: ComponentTypes.RoleSelect,
                      customID: `${panelID}.ticket-access.set`,
                      placeholder: "Select the support roles",
                      defaultValues:
                        panel.ticketAccessIDs.length !== 0
                          ? panel.ticketAccessIDs.map((ticketAccessID) => ({
                              id: ticketAccessID,
                              type: "role",
                            }))
                          : undefined,
                      minValues: 0,
                      maxValues: 5,
                    },
                  ],
                },
              ],
              flags: MessageFlags.Ephemeral,
            },
          });
        }
        break;
      case "customize":
        {
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

          const panelMessage = await client.getMessage(
            panel.channelID,
            panel.messageID
          );

          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              flags: MessageFlags.Ephemeral,
              embeds: panelMessage.embeds,
              components: [
                {
                  type: ComponentTypes.ActionRow,
                  components: panelMessage.components[0].components.map(
                    (component, index) => ({
                      ...component,
                      customID: `${panelID}.button.edit.${index}`,
                    })
                  ),
                },
                {
                  type: ComponentTypes.ActionRow,
                  components: [
                    {
                      type: ComponentTypes.Button,
                      style: ButtonStyles.Primary,
                      label: "Customize Embed",
                      customID: `${panelID}.embed.edit`,
                    },
                    {
                      type: ComponentTypes.Button,
                      style: ButtonStyles.Success,
                      label: "Add Button",
                      customID: `${panelID}.button.add`,
                    },
                    {
                      type: ComponentTypes.Button,
                      style: ButtonStyles.Danger,
                      label: "Remove Button",
                      customID: `${panelID}.button.remove`,
                    },
                  ],
                },
              ],
            },
          });
        }
        break;
    }
  },
};
