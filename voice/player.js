const {
createAudioPlayer,
createAudioResource,
AudioPlayerStatus,
StreamType
} = require("@discordjs/voice");

const play = require("play-dl");

const { getConnection } = require("./connection");

let player = null;

async function playStream(guild, channel, station) {

const connection = getConnection(guild, channel);

if (player) {
try { player.stop(); } catch {}
}

player = createAudioPlayer();

let stream;

// ===== SOURCES =====
if (station.type === "youtube") {
stream = await play.stream(station.url);
}

else if (station.type === "radio") {
stream = await play.stream(station.url);
}

else if (station.type === "playlist") {
const random = station.list[Math.floor(Math.random() * station.list.length)];
stream = await play.stream(random);
}

const resource = createAudioResource(stream.stream, {
inputType: stream.type ?? StreamType.Arbitrary
});

player.play(resource);
connection.subscribe(player);

player.on(AudioPlayerStatus.Idle, () => {
player.stop();
});
}

module.exports = {
playStream
};
