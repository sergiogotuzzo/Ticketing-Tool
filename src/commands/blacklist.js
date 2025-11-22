const {
  Client,
  InteractionCallbackType,
  MessageFlags,
  BitwisePermissionFlags,
  ApplicationCommandOptionType,
  userMention,
  roleMention,
} = require("disgroove");
const Blacklist = require("../models/Blacklist");

module.exports = {
  name: "blacklist",
  description: "Manage the blacklist.",
  defaultMemberPermissions: BitwisePermissionFlags.ManageChannels.toString(),
  options: [
    {
      name: "users",
      description: "Add or remove a user in the blacklist.",
      type: ApplicationCommandOptionType.SubCommandGroup,
      options: [
        {
          name: "add",
          description: "Add a user to the blacklist.",
          type: ApplicationCommandOptionType.SubCommand,
          options: [
            {
              name: "user",
              description: "The user to add.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove a user from the blacklist.",
          type: ApplicationCommandOptionType.SubCommand,
          options: [
            {
              name: "user",
              description: "The user to remove.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "roles",
      description: "Add or remove a role in the blacklist.",
      type: ApplicationCommandOptionType.SubCommandGroup,
      options: [
        {
          name: "add",
          description: "Add a role to the blacklist.",
          type: ApplicationCommandOptionType.SubCommand,
          options: [
            {
              name: "role",
              description: "The role to add.",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove a role from the blacklist.",
          type: ApplicationCommandOptionType.SubCommand,
          options: [
            {
              name: "role",
              description: "The role to remove.",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
      ],
    },

    {
      name: "list",
      description: "Get the blacklist.",
      type: ApplicationCommandOptionType.SubCommand,
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   */
  run: async (client, interaction) => {
    const blacklistData = await Blacklist.findOne({
      guildId: interaction.guildId,
    }).catch(console.error);

    if (!blacklistData)
      Blacklist.create({
        guildId: interaction.guildId,
        usersIds: [],
        rolesIds: [],
      });

    const subCommandGroup = interaction.data.options.find(
      (option) => option.type === ApplicationCommandOptionType.SubCommandGroup
    );

    switch (subCommandGroup?.name) {
      case "users":
        {
          const subCommand = subCommandGroup.options.find(
            (option) => option.type === ApplicationCommandOptionType.SubCommand
          );

          switch (subCommand.name) {
            case "add":
              {
                const userId = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.User
                ).value;

                if (blacklistData.usersIds.includes(userId))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${userMention(
                          userId
                        )} is already in the blacklist.`,
                      },
                    }
                  );

                blacklistData.usersIds.push(userId);
                blacklistData.save();

                client.createInteractionResponse(
                  interaction.id,
                  interaction.token,
                  {
                    type: InteractionCallbackType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: `Added ${userMention(userId)} to the blacklist.`,
                    },
                  }
                );
              }
              break;
            case "remove":
              {
                const userId = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.User
                ).value;

                if (!blacklistData.usersIds.includes(userId))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${userMention(
                          userId
                        )} is not in the blacklist.`,
                      },
                    }
                  );

                blacklistData.usersIds = blacklistData.usersIds.filter(
                  (id) => id != userId
                );
                blacklistData.save();

                client.createInteractionResponse(
                  interaction.id,
                  interaction.token,
                  {
                    type: InteractionCallbackType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: `Removed ${userMention(
                        userId
                      )} from the blacklist.`,
                    },
                  }
                );
              }
              break;
          }
        }
        break;
      case "roles":
        {
          const subCommand = subCommandGroup.options.find(
            (option) => option.type === ApplicationCommandOptionType.SubCommand
          );

          switch (subCommand.name) {
            case "add":
              {
                const roleId = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.Role
                ).value;

                if (blacklistData.rolesIds.includes(roleId))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${roleMention(
                          roleId
                        )} is already in the blacklist.`,
                      },
                    }
                  );

                blacklistData.rolesIds.push(roleId);
                blacklistData.save();

                client.createInteractionResponse(
                  interaction.id,
                  interaction.token,
                  {
                    type: InteractionCallbackType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: `Added ${roleMention(roleId)} to the blacklist.`,
                    },
                  }
                );
              }
              break;
            case "remove":
              {
                const roleId = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.Role
                ).value;

                if (!blacklistData.rolesIds.includes(roleId))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${roleMention(
                          roleId
                        )} is not in the blacklist.`,
                      },
                    }
                  );

                blacklistData.rolesIds = blacklistData.rolesIds.filter(
                  (id) => id != roleId
                );
                blacklistData.save();

                client.createInteractionResponse(
                  interaction.id,
                  interaction.token,
                  {
                    type: InteractionCallbackType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: `Removed ${roleMention(
                        roleId
                      )} from the blacklist.`,
                    },
                  }
                );
              }
              break;
          }
        }
        break;
    }

    const subCommand = interaction.data.options.find(
      (option) => option.type === ApplicationCommandOptionType.SubCommand
    );

    switch (subCommand?.name) {
      case "list":
        {
          client.createInteractionResponse(interaction.id, interaction.token, {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
              flags: MessageFlags.Ephemeral,
              embeds: [
                {
                  title: "Blacklist",
                  description: `The blacklist is a list containing users and roles that will not have any access to the ticketing system. All users and roles will not be able to create tickets, manage panels, etc.`,
                  fields: [
                    {
                      name: "Roles",
                      value:
                        blacklistData.rolesIds.length !== 0
                          ? `${blacklistData.rolesIds.map(
                              (roleId) => `- ${roleMention(roleId)}`
                            )}`
                          : "None",
                      inline: true,
                    },
                    {
                      name: "Users",
                      value:
                        blacklistData.usersIds.length !== 0
                          ? `${blacklistData.usersIds.map(
                              (userId) => `- ${userMention(userId)}`
                            )}`
                          : "None",
                      inline: true,
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
