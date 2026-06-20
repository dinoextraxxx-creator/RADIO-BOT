const {
  Client,
  GatewayIntentBits,
  Events
} = require("discord.js");

const { SELECT_CHANNEL_ID, VOICE_CHANNEL_ID } = require("./config/channels");
const stations = require("./config/stations");
const { buildRadioEmbed } = require("./embeds/radioPanel");
const { buildStationMenu } = require("./menus/stationSelect");
const { playStation, getCurrentStation } = require("./voice/player");
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
  console.log("RADIO BOT READY");

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

  try {
    if (!canChange()) {
      return interaction.reply({
        ephemeral: true,
        content: `⏳ يرجى الانتظار ${remainingSeconds()} ثانية قبل تغيير المحطة مجدداً.`
      });
    }

    const stationKey = interaction.values[0];
    const station = stations[stationKey];

    if (!station) {
      return interaction.reply({ ephemeral: true, content: "محطة غير صالحة." });
    }

    await interaction.deferReply({ ephemeral: true });

    // نقل المستخدم للقناة الصوتية
    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (member.voice.channelId !== VOICE_CHANNEL_ID) {
        await member.voice.setChannel(VOICE_CHANNEL_ID);
      }
    } catch (e) {
      console.log("Move member error:", e.message);
    }

    const textChannel = await client.channels.fetch(SELECT_CHANNEL_ID);

    await playStation(client, stationKey, station, textChannel);

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
      content: "✅ تم تشغيل المحطة، انضم للقناة الصوتية للاستماع."
    });
  } catch (e) {
    console.log("Interaction error:", e.message);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ ephemeral: true, content: "حدث خطأ، حاول مجدداً." });
      } else {
        await interaction.editReply({ content: "حدث خطأ، حاول مجدداً." });
      }
    } catch (err) {
      console.log("Failed to send error reply:", err.message);
    }
  }
});

// إيقاف البوت عند فراغ القناة الصوتية
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
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
