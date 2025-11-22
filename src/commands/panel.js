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
          description: "The Id of the panel.",
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
          description: "The Id of the panel.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "id",
      description: "Get the Id of a panel.",
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
          description: "The Id of the panel.",
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
          description: "The Id of the panel.",
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
          const channelId = subCommand.options.find(
            (option) => option.name === "channel"
          )
            ? subCommand.options.find((option) => option.name === "channel")
                .value
            : interaction.channelId;
          const panelId = subCommand.options.find(
            (option) => option.name === "id"
          )
            ? subCommand.options.find((option) => option.name === "id").value
            : Math.random().toString(16).slice(2);

          console.log(channelId);

          if (panelId.length > 93)
            return client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: "The panel Id you entered is too long!",
                  flags: MessageFlags.Ephemeral,
                },
              }
            );

          const panel = await Panel.findOne({
            guildId: interaction.guildId,
            channelId,
            panelId,
          }).catch(console.error);

          if (panel)
            return client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: `Panel \`${panelId}\` already existing at https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${panel.messageId}.`,
                  flags: MessageFlags.Ephemeral,
                },
              }
            );

          const message = await client.createMessage(channelId, {
            embeds: [
              {
                title: "Open a ticket",
                description: "Click the button below to open a ticket",
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
                    customId: `open.${panelId}.0`,
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
            guildId: interaction.guildId,
            channelId,
            messageId: message.id,
            panelId,
          });

          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              content: `Panel \`${panelId}\` successfully created at https://discord.com/channels/${interaction.guildId}/${channelId}/${message.id}.`,
              flags: MessageFlags.Ephemeral,
            },
          });
        }
        break;
      case "delete":
        {
          const panelId = subCommand.options.find(
            (option) => option.name === "id"
          ).value;

          const panel = await Panel.findOne({
            guildId: interaction.guildId,
            panelId,
          }).catch(console.error);

          if (!panel)
            return client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: `No existing \`${panelId}\` panel.`,
                  flags: MessageFlags.Ephemeral,
                },
              }
            );

          client.deleteMessage(panel.channelId, panel.messageId);

          await Panel.findOneAndDelete({
            guildId: interaction.guildId,
            panelId,
          });

          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              content: `Panel \`${panelId}\` successfully deleted.`,
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
            const messageId = new URL(link).pathname.split("/")[4];

            const panel = await Panel.findOne({
              guildId: interaction.guildId,
              messageId,
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
                  content: `The Id of ${link} is \`${panel.panelId}\`.`,
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
          const panelId = subCommand.options.find(
            (option) => option.name === "id"
          ).value;

          const panel = await Panel.findOne({
            guildId: interaction.guildId,
            panelId,
          }).catch(console.error);

          if (!panel)
            return client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: `No existing \`${panelId}\` panel.`,
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
                  title: `\`${panelId}\` management`,
                  description:
                    "The ticket category is the category where all open tickets (from this panel) will be created. It can help if you want to manage tickets in an orderly and clean manner.\n\nSupport roles are roles that will have immediate access to all open tickets (from this panel). It is recommended to include trusted roles (such as moderators and administrators). You can choose up to 5.\n\nYou can choose both from the menus below.",
                },
              ],
              components: [
                {
                  type: ComponentTypes.ActionRow,
                  components: [
                    {
                      type: ComponentTypes.ChannelSelect,
                      customId: `${panelId}.tickets-parent.set`,
                      channelTypes: [ChannelTypes.GuildCategory],
                      placeholder: "Select the ticket category",
                      defaultValues: panel.ticketsParentId
                        ? [
                            {
                              id: panel.ticketsParentId,
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
                      customId: `${panelId}.ticket-access.set`,
                      placeholder: "Select the support roles",
                      defaultValues:
                        panel.ticketAccessIds.length !== 0
                          ? panel.ticketAccessIds.map((ticketAccessId) => ({
                              id: ticketAccessId,
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
          const panelId = subCommand.options.find(
            (option) => option.name === "id"
          ).value;

          const panel = await Panel.findOne({
            guildId: interaction.guildId,
            panelId,
          }).catch(console.error);

          if (!panel)
            return client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                  content: `No existing \`${panelId}\` panel.`,
                  flags: MessageFlags.Ephemeral,
                },
              }
            );

          const panelMessage = await client.getMessage(
            panel.channelId,
            panel.messageId
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
                      customId: `${panelId}.button.edit.${index}`,
                    })
                  ),
                },
                {
                  type: ComponentTypes.ActionRow,
                  components: [
                    {
                      type: ComponentTypes.Button,
                      style: ButtonStyles.Primary,
                      label: "Edit Embed",
                      customId: `${panelId}.embed.edit`,
                    },
                    {
                      type: ComponentTypes.Button,
                      style: ButtonStyles.Success,
                      label: "Add Button",
                      customId: `${panelId}.button.add`,
                    },
                    {
                      type: ComponentTypes.Button,
                      style: ButtonStyles.Danger,
                      label: "Remove Button",
                      customId: `${panelId}.button.remove`,
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
