const {
  Client,
  InteractionType,
  ComponentTypes,
  InteractionCallbackType,
  MessageFlags,
} = require("disgroove");
const Ticket = require("../../models/Ticket");
const { getTranscriptMessage } = require("../../util/transcript");
const { sendLogTranscript, sendLogMessage } = require("../../util/logging");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {Client} client
   * @param {import("disgroove").Interaction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    if (
      interaction.type !== InteractionType.MessageComponent &&
      interaction.data.componentType !== ComponentTypes.Button
    )
      return;
    if (interaction.data.customId !== "transcript") return;

    const ticketData = await Ticket.findOne({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    }).catch(console.error);

    if (!ticketData) return;

    const transcriptFile = {
      name: `${interaction.channel.name}.txt`,
      contents: Buffer.from(
        await getTranscriptMessage(client, interaction),
        "utf-8"
      ),
    };

    client.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        files: [transcriptFile],
      },
    });

    sendLogMessage(client, interaction.guildId, "TRANSCRIPT_SAVE", {
      ticketName: interaction.channel.name,
      ownerId: ticketData.ownerId,
      guiltyId: interaction.member.user.id,
    });
    sendLogTranscript(client, interaction.guildId, transcriptFile);
  },
};
