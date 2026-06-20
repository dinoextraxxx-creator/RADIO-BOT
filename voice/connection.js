const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const { VOICE_CHANNEL_ID } = require("../config/channels");

async function ensureConnection(client) {
  const channel = await client.channels.fetch(VOICE_CHANNEL_ID);
  if (!channel) throw new Error("Voice channel not found");

  // جلب الاتصال بناءً على معرف السيرفر المستخرج تلقائياً من القناة الصوتية
  let connection = getVoiceConnection(channel.guild.id);

  if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
    return connection;
  }

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
  // فصل تلقائي بدون الحاجة لـ GUILD_ID في متغيرات البيئة
  if (global.lastGuildId) {
    const connection = getVoiceConnection(global.lastGuildId);
    if (connection) connection.destroy();
  }
}

module.exports = { ensureConnection, disconnect };
