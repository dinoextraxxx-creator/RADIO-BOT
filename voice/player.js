const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} = require("@discordjs/voice");
const play = require("play-dl");

const { ensureConnection } = require("./connection");

let player = createAudioPlayer();
let currentStationKey = null;

function getCurrentStation() {
  return currentStationKey;
}

async function playStation(client, stationKey, station, textChannel) {
  try {
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
  } catch (e) {
    console.log("Player error:", e.message);
    if (textChannel) {
      try {
        await textChannel.send(
          `⚠️ تعذّر تشغيل المحطة، حاول مجدداً بعد قليل. (${e.message})`
        );
      } catch (err) {
        console.log("Failed to send error message:", err.message);
      }
    }
    throw e;
  }
}

player.on(AudioPlayerStatus.Idle, () => {
  // الصوت توقف (نهاية الفيديو/انقطاع) - يمكن إضافة منطق إعادة تشغيل هنا لاحقاً
  console.log("Player went idle");
});

player.on("error", (error) => {
  console.log("Audio player error:", error.message);
});

module.exports = { playStation, getCurrentStation, player };
