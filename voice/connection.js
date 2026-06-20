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

module.exports = { getConnection };
