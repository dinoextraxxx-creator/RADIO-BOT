const { 
Client, 
GatewayIntentBits, 
Events 
} = require("discord.js");

const config = require("./config/channels");
const settings = require("./config/settings");
const stations = require("./config/stations");

const radioPanel = require("./embeds/radioPanel");
const stationMenu = require("./menus/stationSelect");

// ===== VOICE SYSTEM =====
const voicePlayer = require("./voice/player");
const cooldownManager = require("./voice/cooldown");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildVoiceStates
]
});

// ===== READY =====
client.once(Events.ClientReady, async () => {
console.log(`Logged in as ${client.user.tag}`);

try {
const channel = await client.channels.fetch(config.SELECTION_CHANNEL);

const messages = await channel.messages.fetch({ limit: 10 });
const exists = messages.find(m => m.author.id === client.user.id);

if (!exists) {
await channel.send({
embeds: [radioPanel()],
components: [stationMenu()]
});

console.log("📻 Radio panel sent");
}
} catch (err) {
console.log("Panel error:", err);
}
});

// ===== INTERACTION =====
client.on(Events.InteractionCreate, async (interaction) => {

if (!interaction.isStringSelectMenu()) return;
if (interaction.customId !== "radio_select") return;

// ===== COOLDOWN =====
const ok = cooldownManager.checkCooldown(
interaction.user.id,
settings.COOLDOWN
);

if (!ok) {
return interaction.reply({
content: `⏳ انتظر ${settings.COOLDOWN} ثانية قبل تغيير المحطة`,
ephemeral: true
});
}

// ===== FIND STATION =====
const station = stations.find(s => s.id === interaction.values[0]);

if (!station) {
return interaction.reply({
content: "❌ المحطة غير موجودة",
ephemeral: true
});
}

// ===== VOICE CHANNEL =====
const voiceChannel = interaction.guild.channels.cache.get(config.RADIO_CHANNEL);

if (!voiceChannel) {
return interaction.reply({
content: "❌ قناة الصوت غير موجودة",
ephemeral: true
});
}

// ===== PLAY =====
try {
await voicePlayer.playStream(
interaction.guild,
voiceChannel,
station
);

await interaction.reply({
content: `🎧 تم تشغيل: **${station.name}**`,
ephemeral: true
});

} catch (err) {
console.log("VOICE ERROR:", err);

return interaction.reply({
content: "❌ حدث خطأ أثناء تشغيل الصوت",
ephemeral: true
});
}

});

client.login(process.env.DISCORD_TOKEN);
