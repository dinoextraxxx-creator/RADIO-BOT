const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior
} = require("@discordjs/voice");
const play = require("play-dl");

const { ensureConnection } = require("./connection");

// تحسين أداء اللاعب لضمان عدم التوقف المفاجئ عند ضعف الاتصال
let player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

let currentStationKey = null;

function getCurrentStation() {
  return currentStationKey;
}

async function playStation(client, stationKey, station) {
  const connection = await ensureConnection(client);
  
  // حفظ آيدي السيرفر لاستخدامه لاحقاً في الفصل التلقائي
  global.lastGuildId = connection.joinConfig.guildId;

  let videoUrl = station.url;

  if (station.type === "youtube_random") {
    videoUrl = station.urls[Math.floor(Math.random() * station.urls.length)];
  }

  // تحسين طريقة فتح البث للتوافق مع البث المباشر والراديو المستمر
  const stream = await play.stream(videoUrl, {
    discordPlayerCompatible: true
  });

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true
  });

  // تعيين حجم الصوت الافتراضي كـ 100% لتجنب انخفاضه تلقائياً
  resource.volume.setVolume(1.0);

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
