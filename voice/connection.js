const { joinVoiceChannel } = require("@discordjs/voice");

let connection = null;

function getConnection(guild, channel) {

if (!connection) {
connection = joinVoiceChannel({
channelId: channel.id,
guildId: guild.id,
adapterCreator: guild.voiceAdapterCreator
});
}

return connection;
}

function destroyConnection() {
if (connection) {
try { connection.destroy(); } catch {}
connection = null;
}
}

module.exports = {
getConnection,
destroyConnection
};
