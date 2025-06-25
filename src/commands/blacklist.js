const {
  Client,
  InteractionCallbackType,
  MessageFlags,
  ComponentTypes,
  BitwisePermissionFlags,
} = require("disgroove");
const Blacklist = require("../models/Blacklist");

module.exports = {
  name: "blacklist",
  description: "Manage the blacklist",
  defaultMemberPermissions: BitwisePermissionFlags.ManageChannels.toString(),
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

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: "Blacklist",
            description:
              "The blacklist is a list containing the users and roles that will not have access to the ticketing system.\nAll users and roles within it will not be able to create tickets, manage panels, etc.\n\nYou can choose the users and roles to be blacklisted via the drop-down menus below with a limit of a maximum of 25 users and 25 roles.",
          },
        ],
        components: [
          {
            type: ComponentTypes.ActionRow,
            components: [
              {
                type: ComponentTypes.UserSelect,
                customID: "blacklist.users.set",
                placeholder: "Users' blacklist",
                defaultValues:
                  blacklistData.usersIDs.length !== 0
                    ? blacklistData.usersIDs.map((userID) => ({
                        id: userID,
                        type: "user",
                      }))
                    : undefined,
                minValues: 0,
                maxValues: 25,
              },
            ],
          },
          {
            type: ComponentTypes.ActionRow,
            components: [
              {
                type: ComponentTypes.RoleSelect,
                customID: "blacklist.roles.set",
                placeholder: "Roles' blacklist",
                defaultValues:
                  blacklistData.rolesIDs.length !== 0
                    ? blacklistData.rolesIDs.map((roleID) => ({
                        id: roleID,
                        type: "role",
                      }))
                    : undefined,
                minValues: 0,
                maxValues: 25,
              },
            ],
          },
        ],
      },
    });
  },
};
