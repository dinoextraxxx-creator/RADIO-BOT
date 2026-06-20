const {
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags
} = require("discord.js");

const { SELECT_CHANNEL_ID, VOICE_CHANNEL_ID } = require("./config/channels");
const stations = require("./config/stations");
const { buildRadioEmbed } = require("./embeds/radioPanel");
const { buildStationMenu } = require("./menus/stationSelect");
const { playStation } = require("./voice/player");
const { canChange, remainingSeconds, recordChange } = require("./voice/cooldown");
const { disconnect } = require("./voice/connection");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

let panelMessage = null;

client.once(Events.ClientReady, async () => {
  console.log("🟢 RADIO BOT READY");

  try {
    const channel = await client.channels.fetch(SELECT_CHANNEL_ID);
    const embed = buildRadioEmbed({});
    const row = buildStationMenu();

    panelMessage = await channel.send({ embeds: [embed], components: [row] });
  } catch (e) {
    console.log("Panel init error:", e.message);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "station_select") return;

  // 1) تأكيد التفاعل فوراً لعدم حدوث خطأ "Interaction Failed" في ديسكورد
  try {
    if (!canChange()) {
      return interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `⏳ يرجى الانتظار ${remainingSeconds()} ثانية قبل تغيير المحطة مجدداً.`
      });
    }

    const stationKey = interaction.values[0];
    const station = stations[stationKey];

    if (!station) {
      return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "محطة غير صالحة." });
    }

    // إعلام ديسكورد أن البوت يفكر ويقوم بمعالجة الطلب الآن
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // 2) جلب العضو ونقله فوراً للقناة الصوتية المستهدفة
    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      
      // التحقق مما إذا كان العضو متواجد في أي قناة صوتية أصلاً ليتمكن البوت من نقله
      if (!member.voice.channelId) {
        return interaction.editReply({
          content: "⚠️ يجب أن تكون متصلاً بأي قناة صوتية أولاً حتى يتمكن البوت من نقلك تلقائياً."
        });
      }

      // إذا كان في قناة مختلفة، يتم سحبه فوراً إلى قناة الراديو
      if (member.voice.channelId !== VOICE_CHANNEL_ID) {
        await member.voice.setChannel(VOICE_CHANNEL_ID);
        console.log(`📌 تم نقل العضو ${interaction.user.tag} إلى القناة الصوتية المحددة.`);
      }
    } catch (e) {
      console.log("❌ فشل نقل العضو (تأكد من إعطاء البوت صلاحية Move Members):", e.message);
    }

    // 3) البوت يدخل ويبدأ تشغيل الصوت
    await playStation(client, stationKey, station);

    recordChange(stationKey, interaction.user.id);

    const embed = buildRadioEmbed({
      currentStationKey: stationKey,
      changedBy: interaction.user.id,
      status: "🟢 يعمل"
    });

    if (panelMessage) {
      await panelMessage.edit({ embeds: [embed] });
    }

    await interaction.editReply({
      content: "✅ تم تشغيل المحطة بنجاح، وتم نقلك للاستماع!"
    });

  } catch (e) {
    console.log("Interaction error:", e.message);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          flags: [MessageFlags.Ephemeral],
          content: `⚠️ تعذّر تشغيل المحطة، حاول مجدداً بعد قليل. (${e.message})`
        });
      } else {
        await interaction.editReply({
          content: `⚠️ تعذّر تشغيل المحطة، حاول مجدداً بعد قليل. (${e.message})`
        });
      }
    } catch (err) {
      console.log("Failed to send error reply:", err.message);
    }
  }
});

client.on(Events.VoiceStateUpdate, (oldState) => {
  const channel = oldState.channel;
  if (!channel || channel.id !== VOICE_CHANNEL_ID) return;

  const membersLeft = channel.members.filter((m) => !m.user.bot).size;

  if (membersLeft === 0) {
    console.log("Voice channel empty, disconnecting...");
    disconnect();
  }
});

process.on("unhandledRejection", (e) => console.log("Unhandled:", e));

client.login(process.env.TOKEN);
