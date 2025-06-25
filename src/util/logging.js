const { userMention, Client } = require("disgroove");
const Logging = require("../models/Logging");

/**
 *
 * @param {Client} client
 * @param {*} guildID
 * @param {*} action
 * @param {*} data
 * @returns
 */
async function sendLogMessage(client, guildID, action, data) {
  const loggingData = await Logging.findOne({
    guildID,
  }).catch(console.error);

  if (!loggingData) return;
  if (!loggingData.channelID || !loggingData.actions.includes(action)) return;

  let embed = {
    title: "",
    description: `**Ticket owner**: ${userMention(data.ownerID)}`,
    timestamp: new Date().toISOString(),
  };

  if (data.guiltyID)
    embed.description += `\n**Staffer**: ${userMention(data.guiltyID)}`;
  if (data.victimID)
    embed.description += `\n**User**: ${userMention(data.victimID)}`;

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

  client.createMessage(loggingData.channelID, {
    embeds: [embed],
  });
}

/**
 *
 * @param {Client} client
 * @param {*} guildID
 * @param {import("disgroove").File} file
 * @returns
 */
async function sendLogTranscript(client, guildID, file) {
  const loggingData = await Logging.findOne({
    guildID,
  }).catch(console.error);

  if (!loggingData) return;
  if (!loggingData.channelID) return;

  client.createMessage(loggingData.channelID, {
    files: [file],
  });
}

module.exports = {
  sendLogMessage,
  sendLogTranscript,
};
