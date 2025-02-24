const {
  ChannelTypes,
  Client,
  InteractionCallbackType,
  MessageFlags,
  ComponentTypes,
  BitwisePermissionFlags,
} = require("disgroove");
const Config = require("../models/Config");

module.exports = {
  name: "logging",
  description: "Manage the logging system",
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
            title: "Logging Configuration",
            description:
              "Il logging serve a monitorare le azioni che vengono eseguite nei ticket tramite dei messaggi, mandati in un canale testuale.\nVengono mandati dati principali come il proprietario del ticket, chi ha eseguito l'azione, quando è stata eseguita l'azione, ecc.\nLe azioni che vengono monitorate sono le seguenti:\n- Apertura di un ticket\n- Chiusura di un ticket\n- Salvataggio del transcript di un ticket\n- Utente aggiunto ad un ticket\n- Utente cacciato da un ticket\n\nPer scegliere il canale di logging e le azioni da monitorare puoi cliccare i menù a tendina qui sotto.",
          },
        ],
        components: [
          {
            type: ComponentTypes.ActionRow,
            components: [
              {
                type: ComponentTypes.ChannelSelect,
                customID: "logging.channel.set",
                channelTypes: [ChannelTypes.GuildText],
                placeholder: "Select the logging channel",
                defaultValues: configData.loggingChannelID
                  ? [
                      {
                        id: configData.loggingChannelID,
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
                type: ComponentTypes.StringSelect,
                customID: "logging.actions.set",
                options: [
                  {
                    label: "Ticket opening",
                    value: "OPEN",
                    description: "When a user creates a ticket",
                    default: configData.loggingActions.includes("OPEN"),
                  },
                  {
                    label: "Ticket closing",
                    value: "CLOSE",
                    description: "When a user closes a ticket",
                    default: configData.loggingActions.includes("CLOSE"),
                  },
                  {
                    label: "Ticket transcript save",
                    value: "TRANSCRIPT_SAVE",
                    description: "When a user save the transcript of a ticket",
                    default:
                      configData.loggingActions.includes("TRANSCRIPT_SAVE"),
                  },
                  {
                    label: "User adding",
                    value: "ADD",
                    description: "When a user adds another user to a ticket",
                    default: configData.loggingActions.includes("ADD"),
                  },
                  {
                    label: "User kicking",
                    value: "KICK",
                    description: "When a user kicks another user from a ticket",
                    default: configData.loggingActions.includes("KICK"),
                  },
                ],
                placeholder: "Select the actions to log",
                minValues: 0,
                maxValues: 5,
              },
            ],
          },
        ],
      },
    });
  },
};
