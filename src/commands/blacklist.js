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
      guildID: interaction.guildID,
    }).catch(console.error);

    if (!blacklistData)
      Blacklist.create({
        guildID: interaction.guildID,
        usersIDs: [],
        rolesIDs: [],
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
                const userID = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.User
                ).value;

                if (blacklistData.usersIDs.includes(userID))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${userMention(
                          userID
                        )} is already in the blacklist.`,
                      },
                    }
                  );

                blacklistData.usersIDs.push(userID);
                blacklistData.save();

                client.createInteractionResponse(
                  interaction.id,
                  interaction.token,
                  {
                    type: InteractionCallbackType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: `Added ${userMention(userID)} to the blacklist.`,
                    },
                  }
                );
              }
              break;
            case "remove":
              {
                const userID = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.User
                ).value;

                if (!blacklistData.usersIDs.includes(userID))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${userMention(
                          userID
                        )} is not in the blacklist.`,
                      },
                    }
                  );

                blacklistData.usersIDs = blacklistData.usersIDs.filter(
                  (id) => id != userID
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
                        userID
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
                const roleID = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.Role
                ).value;

                if (blacklistData.rolesIDs.includes(roleID))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${roleMention(
                          roleID
                        )} is already in the blacklist.`,
                      },
                    }
                  );

                blacklistData.rolesIDs.push(roleID);
                blacklistData.save();

                client.createInteractionResponse(
                  interaction.id,
                  interaction.token,
                  {
                    type: InteractionCallbackType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: `Added ${roleMention(roleID)} to the blacklist.`,
                    },
                  }
                );
              }
              break;
            case "remove":
              {
                const roleID = subCommand.options.find(
                  (option) => option.type === ApplicationCommandOptionType.Role
                ).value;

                if (!blacklistData.rolesIDs.includes(roleID))
                  return client.createInteractionResponse(
                    interaction.id,
                    interaction.token,
                    {
                      type: InteractionCallbackType.ChannelMessageWithSource,
                      data: {
                        flags: MessageFlags.Ephemeral,
                        content: `${roleMention(
                          roleID
                        )} is not in the blacklist.`,
                      },
                    }
                  );

                blacklistData.rolesIDs = blacklistData.rolesIDs.filter(
                  (id) => id != roleID
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
                        roleID
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
                        blacklistData.rolesIDs.length !== 0
                          ? `${blacklistData.rolesIDs.map(
                              (roleID) => `- ${roleMention(roleID)}`
                            )}`
                          : "None",
                      inline: true,
                    },
                    {
                      name: "Users",
                      value:
                        blacklistData.usersIDs.length !== 0
                          ? `${blacklistData.usersIDs.map(
                              (userID) => `- ${userMention(userID)}`
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
