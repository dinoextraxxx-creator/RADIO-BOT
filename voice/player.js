const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const play = require("play-dl");

const { ensureConnection } = require("./connection");

let player = createAudioPlayer();
let currentStationKey = null;

function getCurrentStation() {
  return currentStationKey;
}

async function playStation(client, stationKey, station) {
  const connection = await ensureConnection(client);

  let videoUrl = station.url;

  if (station.type === "youtube_random") {
    videoUrl = station.urls[Math.floor(Math.random() * station.urls.length)];
  }

  const stream = await play.stream(videoUrl);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type
  });

  player.play(resource);
  connection.subscribe(player);

  currentStationKey = stationKey;
}

player.on(AudioPlayerStatus.Idle, () => {
  console.log("Player went idle");
});

player.on("error", (error) => {
  console.log("Audio player error:", error.message);
});

module.exports = { playStation, getCurrentStation, player };
