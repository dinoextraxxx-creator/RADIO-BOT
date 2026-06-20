const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const { VOICE_CHANNEL_ID } = require("../config/channels");

async function ensureConnection(client) {
  let connection = getVoiceConnection(process.env.GUILD_ID);

  if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
    return connection;
  }

  const channel = await client.channels.fetch(VOICE_CHANNEL_ID);
  if (!channel) throw new Error("Voice channel not found");

  connection = joinVoiceChannel({
    channelId: VOICE_CHANNEL_ID,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 15000);
  } catch (e) {
    connection.destroy();
    throw new Error("Failed to connect to voice channel");
  }

  return connection;
}

function disconnect() {
  const connection = getVoiceConnection(process.env.GUILD_ID);
  if (connection) connection.destroy();
}

module.exports = { ensureConnection, disconnect };
