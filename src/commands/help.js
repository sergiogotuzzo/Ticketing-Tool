const {
  Client,
  InteractionCallbackType,
  MessageFlags,
  ApplicationCommandOptionType,
  slashCommandMention,
} = require("disgroove");

module.exports = {
  name: "help",
  description: "List of bot's commands",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   */
  run: async (client, interaction) => {
    const cmds = await client.getGlobalApplicationCommands(
      client.application.id
    );
    const filter = (cmd) =>
      cmd.type === ApplicationCommandOptionType.SubCommand ||
      cmd.type === ApplicationCommandOptionType.SubCommandGroup;

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        embeds: [
          {
            color: 5793266,
            title: "Commands' list",
            description: cmds
              .map((cmd) =>
                cmd.options?.filter(filter).length > 0
                  ? cmd.options
                      .filter(filter)
                      .map((subCmd) =>
                        subCmd.options?.filter(filter).length > 0
                          ? subCmd.options
                              .filter(filter)
                              .map(
                                (subSubCmd) =>
                                  `- ${slashCommandMention(
                                    cmd.name,
                                    cmd.id,
                                    subSubCmd.name,
                                    subCmd.name
                                  )}: ${subSubCmd.description}`
                              )
                              .join("\n")
                          : `- ${slashCommandMention(
                              cmd.name,
                              cmd.id,
                              subCmd.name
                            )}: ${subCmd.description}`
                      )
                      .join("\n")
                  : `- ${slashCommandMention(cmd.name, cmd.id)}: ${
                      cmd.description
                    }`
              )
              .join("\n"),
          },
        ],
        flags: MessageFlags.Ephemeral,
      },
    });
  },
};
