const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const { VOICE_CHANNEL_ID } = require("../config/channels");

let lastReadyAt = 0;
const GRACE_PERIOD_MS = 25 * 1000; // 25 ثانية سماح بعد الاتصال

async function ensureConnection(client) {
  const guildId = process.env.GUILD_ID;

  let connection = getVoiceConnection(guildId);

  if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
    console.log("Reusing existing voice connection");
    return connection;
  }

  const channel = await client.channels.fetch(VOICE_CHANNEL_ID);
  if (!channel) throw new Error("Voice channel not found");

  console.log("Attempting to join voice channel:", VOICE_CHANNEL_ID);

  connection = joinVoiceChannel({
    channelId: VOICE_CHANNEL_ID,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false
  });

  connection.on("stateChange", (oldState, newState) => {
    console.log(`Voice connection state: ${oldState.status} -> ${newState.status}`);
  });

  connection.on("error", (error) => {
    console.log("Voice connection error event:", error.message);
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30000);
    console.log("Voice connection is Ready");
    lastReadyAt = Date.now();
  } catch (e) {
    console.log("Voice connection failed to become Ready:", e.message);
    connection.destroy();
    throw new Error("Failed to connect to voice channel (timeout after 30s)");
  }

  return connection;
}

function disconnect() {
  const connection = getVoiceConnection(process.env.GUILD_ID);
  if (connection) {
    console.log("Disconnecting voice connection");
    connection.destroy();
  }
}

function isInGracePeriod() {
  return Date.now() - lastReadyAt < GRACE_PERIOD_MS;
}

module.exports = { ensureConnection, disconnect, isInGracePeriod };
