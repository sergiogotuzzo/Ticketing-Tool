const {
  Client,
  InteractionCallbackType,
  MessageFlags,
  ComponentTypes,
  BitwisePermissionFlags,
} = require("disgroove");
const Config = require("../models/Config");

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
    const configData = await Config.findOne({
      guildID: interaction.guildID,
    }).catch(console.error);

    if (!configData)
      Config.create({
        guildID: interaction.guildID,
        loggingChannelID: null,
        loggingActions: [],
        blacklistUsersIDs: [],
        blacklistRolesIDs: [],
      });

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: "Blacklist",
            description:
              "La lista nera è una lista contenente gli utenti ed i ruoli che non avranno accesso al sistema di ticketing.\nTutti gli utenti ed i ruoli al suo interno non potranno creare ticket, gestire pannelli ecc...\nNon si possono aggiungere alla lista utenti o ruoli con importanza maggiore del bot (Quindi con un ruolo superiore o un amministratore).\nSe un utente o un utente con un ruolo nella lista nera viene inserito mentre ha un ticket aperto il ticket verrà chiuso dopo 5 secondi dall'inserimento dell'utente o ruolo nella lista nera.\n\nPuoi scegliere gli utenti ed i ruoli da mettere nella lista nera tramite i menù a tendina sottostanti con un limite di massimo 25 utenti e di 25 ruoli.",
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
                  configData.blacklistUsersIDs.length !== 0
                    ? configData.blacklistUsersIDs.map((userID) => ({
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
                  configData.blacklistRolesIDs.length !== 0
                    ? configData.blacklistRolesIDs.map((roleID) => ({
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
