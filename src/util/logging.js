const { userMention, Client } = require("disgroove");
const Config = require("../models/Config");

/**
 *
 * @param {Client} client
 * @param {*} guildID
 * @param {*} action
 * @param {*} data
 * @returns
 */
async function sendLogMessage(client, guildID, action, data) {
  const configData = await Config.findOne({
    guildID,
  }).catch(console.error);

  if (!configData) return;
  if (
    !configData.loggingChannelID ||
    !configData.loggingActions.includes(action)
  )
    return;

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

  client.createMessage(configData.loggingChannelID, {
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
  const configData = await Config.findOne({
    guildID,
  }).catch(console.error);

  if (!configData) return;
  if (!configData.loggingChannelID) return;

  client.createMessage(configData.loggingChannelID, {
    files: [file],
  });
}

module.exports = {
  sendLogMessage,
  sendLogTranscript,
};
