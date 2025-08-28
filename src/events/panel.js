const {
  Client,
  InteractionType,
  ComponentTypes,
  InteractionCallbackType,
  TextInputStyles,
  ButtonStyles,
  MessageFlags,
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
    const customID = interaction.data.customID;

    if (!customID || customID.startsWith("open") || !customID.includes("."))
      return;

    const panelID = customID.split(".")[0]; // "ID.category.action"

    const panelData = await Panel.findOne({
      guildID: interaction.guildID,
      panelID,
    }).catch(console.error);

    if (!panelData) return;

    const category = customID.split(".")[1];
    const action = customID.split(".")[2];

    if (interaction.type === InteractionType.MessageComponent) {
      if (
        interaction.data.componentType === ComponentTypes.ChannelSelect &&
        category === "tickets-parent" &&
        action === "set"
      ) {
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
        category === "ticket-access" &&
        action === "set"
      ) {
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
      } else if (interaction.data.componentType === ComponentTypes.Button) {
        const panelMessage = await client.getMessage(
          panelData.channelID,
          panelData.messageID
        );

        if (category === "embed" && action === "edit") {
          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.Modal,
            data: {
              customID: `${panelID}.embed.edit`,
              title: `Customize \`${panelID}\` Embed`,
              components: [
                {
                  type: ComponentTypes.Label,
                  label: "Title",
                  component: {
                    type: ComponentTypes.TextInput,
                    customID: `${panelID}.embed.edit.title`,
                    style: TextInputStyles.Paragraph,
                    minLength: 0,
                    maxLength: 256,
                    required: false,
                    value:
                      panelMessage.embeds[0].title !== undefined
                        ? panelMessage.embeds[0].title
                        : undefined,
                    placeholder: "Support",
                  },
                },
                {
                  type: ComponentTypes.Label,
                  label: "Description",
                  component: {
                    type: ComponentTypes.TextInput,
                    customID: `${panelID}.embed.edit.description`,
                    style: TextInputStyles.Paragraph,
                    minLength: 1,
                    maxLength: 4000,
                    required: true,
                    value: panelMessage.embeds[0].description,
                    placeholder: 'Click "Open" to create a ticket.',
                  },
                },
                {
                  type: ComponentTypes.Label,
                  label: "Color",
                  component: {
                    type: ComponentTypes.TextInput,
                    customID: `${panelID}.embed.edit.color`,
                    style: TextInputStyles.Short,
                    minLength: 1,
                    maxLength: 10,
                    required: true,
                    value: panelMessage.embeds[0].color,
                    placeholder: "5793266",
                  },
                },
              ],
            },
          });
        } else if (category === "button") {
          if (action === "add") {
            if (panelMessage.components[0].components.length === 5)
              return client.createInteractionResponse(
                interaction.id,
                interaction.token,
                {
                  type: InteractionCallbackType.ChannelMessageWithSource,
                  data: {
                    content:
                      "You have reached the maximum limit of buttons (5)!",
                    flags: MessageFlags.Ephemeral,
                  },
                }
              );

            client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.Modal,
                data: {
                  customID: `${panelID}.button.add`,
                  title: `Add Button To \`${panelID}\``,
                  components: [
                    {
                      type: ComponentTypes.Label,
                      label: "Label",
                      component: {
                        type: ComponentTypes.TextInput,
                        customID: `${panelID}.button.add.label`,
                        style: TextInputStyles.Short,
                        minLength: 0,
                        maxLength: 80,
                        required: true,
                      },
                    },
                    {
                      type: ComponentTypes.Label,
                      label: "Emoji",
                      component: {
                        type: ComponentTypes.TextInput,
                        customID: `${panelID}.button.add.emoji`,
                        style: TextInputStyles.Short,
                        minLength: 1,
                        maxLength: 1,
                        required: false,
                      },
                    },
                    {
                      type: ComponentTypes.Label,
                      label: "Style",
                      component: {
                        type: ComponentTypes.TextInput,
                        customID: `${panelID}.button.add.style`,
                        style: TextInputStyles.Short,
                        minLength: 1,
                        maxLength: 7,
                        required: true,
                        value: "Blurple",
                        placeholder: "Blurple, Gray, Red or Green",
                      },
                    },
                  ],
                },
              }
            );
          } else if (action === "remove") {
            if (panelMessage.components[0].components.length === 1)
              return client.createInteractionResponse(
                interaction.id,
                interaction.token,
                {
                  type: InteractionCallbackType.ChannelMessageWithSource,
                  data: {
                    content: "You cannot remove more than 4 buttons.",
                    flags: MessageFlags.Ephemeral,
                  },
                }
              );

            const i = customID.split(".")[3];

            if (i) {
              panelMessage.components[0].components.splice(Number(i), 1);

              client.editMessage(panelData.channelID, panelData.messageID, {
                embeds: panelMessage.embeds,
                components: [
                  {
                    type: ComponentTypes.ActionRow,
                    components: panelMessage.components[0].components.map(
                      (component, index) => ({
                        ...component,
                        customID: `open.${panelID}.${index}`,
                      })
                    ),
                  },
                ],
              });

              client.createInteractionResponse(
                interaction.id,
                interaction.token,
                {
                  type: InteractionCallbackType.ChannelMessageWithSource,
                  data: {
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
                    embeds: panelMessage.embeds,
                  },
                }
              );
            } else {
              client.createInteractionResponse(
                interaction.id,
                interaction.token,
                {
                  type: InteractionCallbackType.ChannelMessageWithSource,
                  data: {
                    embeds: panelMessage.embeds,
                    components: [
                      {
                        type: ComponentTypes.ActionRow,
                        components: panelMessage.components[0].components.map(
                          (component, index) => ({
                            ...component,
                            customID: `${panelID}.button.remove.${index}`,
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
                            disabled: true,
                          },
                          {
                            type: ComponentTypes.Button,
                            style: ButtonStyles.Success,
                            label: "Add Button",
                            customID: `${panelID}.button.add`,
                            disabled: true,
                          },
                          {
                            type: ComponentTypes.Button,
                            style: ButtonStyles.Danger,
                            label: "Remove Button",
                            customID: `${panelID}.button.remove`,
                            disabled: true,
                          },
                        ],
                      },
                    ],
                  },
                }
              );
            }
          } else if (action === "edit") {
            const index = customID.split(".")[3];

            const panelMessage = await client.getMessage(
              panelData.channelID,
              panelData.messageID
            );

            let style =
              panelMessage.components[0].components[Number(index)].style;

            switch (style) {
              case ButtonStyles.Primary:
                {
                  style = "Blurple";
                }
                break;
              case ButtonStyles.Secondary:
                {
                  style = "Gray";
                }
                break;
              case ButtonStyles.Danger:
                {
                  style = "Red";
                }
                break;
              case ButtonStyles.Success:
                {
                  style = "Green";
                }
                break;
            }

            client.createInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionCallbackType.Modal,
                data: {
                  customID: `${panelID}.button.edit.${index}`,
                  title: `Add Button To \`${panelID}\``,
                  components: [
                    {
                      type: ComponentTypes.Label,
                      label: "Label",
                      component: {
                        type: ComponentTypes.TextInput,
                        customID: `${panelID}.button.edit.${index}.label`,
                        style: TextInputStyles.Short,
                        minLength: 0,
                        maxLength: 80,
                        value:
                          panelMessage.components[0].components[Number(index)]
                            .label,
                        required: true,
                      },
                    },
                    {
                      type: ComponentTypes.Label,
                      label: "Emoji",
                      component: {
                        type: ComponentTypes.TextInput,
                        customID: `${panelID}.button.edit.${index}.emoji`,
                        style: TextInputStyles.Short,
                        minLength: 1,
                        maxLength: 3,
                        value:
                          panelMessage.components[0].components[Number(index)]
                            .emoji?.name !== undefined
                            ? panelMessage.components[0].components[
                                Number(index)
                              ].emoji.name
                            : undefined,
                        required: false,
                      },
                    },
                    {
                      type: ComponentTypes.Label,
                      label: "Style",
                      component: {
                        type: ComponentTypes.TextInput,
                        customID: `${panelID}.button.edit.${index}.style`,
                        style: TextInputStyles.Short,
                        minLength: 1,
                        maxLength: 7,
                        required: true,
                        value: style,
                        placeholder: "Blurple, Gray, Red or Green",
                      },
                    },
                  ],
                },
              }
            );
          }
        }
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const panelMessage = await client.getMessage(
        panelData.channelID,
        panelData.messageID
      );

      if (category === "embed" && action === "edit") {
        const title = interaction.data.components[0].components.find(
          (component) => component.customID.endsWith("title")
        ).value;
        const description = interaction.data.components[1].components.find(
          (component) => component.customID.endsWith("description")
        ).value;
        const color = interaction.data.components[2].components.find(
          (component) => component.customID.endsWith("color")
        ).value;

        client.editMessage(panelData.channelID, panelData.messageID, {
          components: panelMessage.components,
          embeds: [
            {
              title: title !== undefined ? title : undefined,
              description,
              color,
            },
          ],
        });

        client.createInteractionResponse(interaction.id, interaction.token, {
          type: InteractionCallbackType.ChannelMessageWithSource,
          data: {
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
            embeds: [
              {
                title: title !== undefined ? title : undefined,
                description,
                color,
              },
            ],
          },
        });
      } else if (category === "button") {
        if (action === "add") {
          const label = interaction.data.components[0].components.find(
            (component) => component.customID.endsWith("label")
          ).value;
          const emoji = interaction.data.components[1].components.find(
            (component) => component.customID.endsWith("emoji")
          ).value;
          let style = interaction.data.components[2].components.find(
            (component) => component.customID.endsWith("style")
          ).value;

          switch (style) {
            case "Blurple":
              {
                style = ButtonStyles.Primary;
              }
              break;
            case "Gray":
              {
                style = ButtonStyles.Secondary;
              }
              break;
            case "Red":
              {
                style = ButtonStyles.Danger;
              }
              break;
            case "Green":
              {
                style = ButtonStyles.Success;
              }
              break;
          }

          panelMessage.components[0].components.push({
            label,
            emoji:
              emoji !== ""
                ? {
                    id: null,
                    name: emoji,
                  }
                : undefined,
            style,
            type: ComponentTypes.Button,
          });

          client.editMessage(panelData.channelID, panelData.messageID, {
            components: [
              {
                type: ComponentTypes.ActionRow,
                components: panelMessage.components[0].components.map(
                  (component, index) => ({
                    ...component,
                    customID: `open.${panelID}.${index}`,
                  })
                ),
              },
            ],
            embeds: panelMessage.embeds,
          });

          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
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
              embeds: panelMessage.embeds,
            },
          });
        } else if (action === "edit") {
          const i = customID.split(".")[3];

          const label = interaction.data.components[0].components.find(
            (component) => component.customID.endsWith("label")
          ).value;
          const emoji = interaction.data.components[1].components.find(
            (component) => component.customID.endsWith("emoji")
          ).value;
          let style = interaction.data.components[2].components.find(
            (component) => component.customID.endsWith("style")
          ).value;

          switch (style) {
            case "Blurple":
              {
                style = ButtonStyles.Primary;
              }
              break;
            case "Gray":
              {
                style = ButtonStyles.Secondary;
              }
              break;
            case "Red":
              {
                style = ButtonStyles.Danger;
              }
              break;
            case "Green":
              {
                style = ButtonStyles.Success;
              }
              break;
          }

          panelMessage.components[0].components[Number(i)] = {
            type: ComponentTypes.Button,
            label,
            emoji:
              emoji !== ""
                ? {
                    id: null,
                    name: emoji,
                  }
                : undefined,
            style,
          };

          client.editMessage(panelData.channelID, panelData.messageID, {
            embeds: panelMessage.embeds,
            components: [
              {
                type: ComponentTypes.ActionRow,
                components: panelMessage.components[0].components.map(
                  (component, index) => ({
                    ...component,
                    customID: `open.${panelID}.${index}`,
                  })
                ),
              },
            ],
          });

          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
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
              embeds: panelMessage.embeds,
            },
          });
        }
      }
    }
  },
};
