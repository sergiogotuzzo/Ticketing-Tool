const { Client } = require("disgroove");

/**
 *
 * @param {Client} client
 * @param {import("disgroove").Channel} channel
 * @returns
 */
async function getAllMessages(client, channelID) {
  let allMessages = [];
  let lastMessageID;

  while (true) {
    const options = { limit: 100 };

    if (lastMessageID) options.before = lastMessageID;

    let messages = await client.getMessages(channelID, options);

    allMessages = allMessages.concat(Array.from(messages.values()));

    lastMessageID = messages.reverse()[0].id;

    if (messages.length != 100) break;
  }

  return allMessages;
}

/**
 *
 * @param {Client} client
 * @param {import("disgroove").Interaction} interaction
 */
async function getTranscriptMessage(client, interaction) {
  let transcriptMessage = `#${interaction.channel.name}\n\n`;

  const messages = await getAllMessages(client, interaction.channelID);

  messages.reverse().forEach(
    /**
     *
     * @param {import("disgroove/dist/lib/types/message").Message} msg
     */
    (msg) => {
      const date = new Date(msg.timestamp);
      const dateString = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;

      transcriptMessage += `${dateString} - @${msg.author.username}: ${
        msg.content || ""
      }\n`;
    }
  );

  return transcriptMessage;
}

module.exports = {
  getAllMessages,
  getTranscriptMessage,
};
