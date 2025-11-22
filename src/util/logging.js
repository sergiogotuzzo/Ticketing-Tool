const { userMention, Client } = require("disgroove");
const Logging = require("../models/Logging");

/**
 *
 * @param {Client} client
 * @param {*} guildId
 * @param {*} action
 * @param {*} data
 * @returns
 */
async function sendLogMessage(client, guildId, action, data) {
  const loggingData = await Logging.findOne({
    guildId,
  }).catch(console.error);

  if (!loggingData) return;
  if (!loggingData.channelId || !loggingData.actions.includes(action)) return;

  let embed = {
    title: "",
    description: `**Owner**: ${userMention(data.ownerId)}`,
    timestamp: new Date().toISOString(),
  };

  if (data.guiltyId)
    embed.description += `\n**By**: ${userMention(data.guiltyId)}`;
  if (data.victimId)
    embed.description += `\n**User**: ${userMention(data.victimId)}`;

  switch (action) {
    case "OPEN":
      {
        embed.title = `Opened #${data.ticketName}`;
      }
      break;
    case "CLOSE":
      {
        embed.title = `#${data.ticketName} closed`;
      }
      break;
    case "TRANSCRIPT_SAVE":
      {
        embed.title = `#${data.ticketName} transcript saved`;
      }
      break;
    case "ADD":
      {
        embed.title = `User added to #${data.ticketName}`;
      }
      break;
    case "KICK":
      {
        embed.title = `User kicked from #${data.ticketName}`;
      }
      break;
  }

  client.createMessage(loggingData.channelId, {
    embeds: [embed],
  });
}

/**
 *
 * @param {Client} client
 * @param {*} guildId
 * @param {import("disgroove").File} file
 * @returns
 */
async function sendLogTranscript(client, guildId, file) {
  const loggingData = await Logging.findOne({
    guildId,
  }).catch(console.error);

  if (!loggingData) return;
  if (!loggingData.channelId) return;

  client.createMessage(loggingData.channelId, {
    files: [file],
  });
}

module.exports = {
  sendLogMessage,
  sendLogTranscript,
};
