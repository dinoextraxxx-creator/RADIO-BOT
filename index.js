const {
Client,
GatewayIntentBits,
Events
} = require("discord.js");

const {
joinVoiceChannel,
createAudioPlayer,
createAudioResource,
AudioPlayerStatus,
StreamType
} = require("@discordjs/voice");

const play = require("play-dl");

const config = require("./config/channels");
const settings = require("./config/settings");
const stations = require("./config/stations");

const radioPanel = require("./embeds/radioPanel");
const stationMenu = require("./menus/stationSelect");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildVoiceStates
]
});

// ===== STATE =====
let currentPlayer = null;
let currentConnection = null;
let currentStation = null;
let cooldown = new Map();

// ===== SEND PANEL =====
client.once(Events.ClientReady, async () => {
console.log(`Logged in as ${client.user.tag}`);

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
});

// ===== MOVE USERS =====
async function moveUsers(guild, channelId) {
const channel = await guild.channels.fetch(channelId);

guild.channels.cache.forEach(ch => {
if (ch.type === 2 && ch.id !== channelId) {
ch.members.forEach(member => {
member.voice.setChannel(channel).catch(() => {});
});
}
});
}

// ===== PLAY STREAM =====
async function playStream(guild, station, voiceChannel) {

if (!voiceChannel) return;

if (currentConnection) {
try { currentConnection.destroy(); } catch {}
}

currentConnection = joinVoiceChannel({
channelId: voiceChannel.id,
guildId: guild.id,
adapterCreator: guild.voiceAdapterCreator
});

const player = createAudioPlayer();
currentPlayer = player;

let stream;

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
currentConnection.subscribe(player);

player.on(AudioPlayerStatus.Idle, () => {
player.stop();
});

}

// ===== INTERACTIONS =====
client.on(Events.InteractionCreate, async (interaction) => {

if (!interaction.isStringSelectMenu()) return;
if (interaction.customId !== "radio_select") return;

const userId = interaction.user.id;

// ===== COOLDOWN =====
const last = cooldown.get(userId);
if (last && Date.now() - last < settings.COOLDOWN * 1000) {
return interaction.reply({
content: `⏳ انتظر ${settings.COOLDOWN} ثانية قبل تغيير المحطة`,
ephemeral: true
});
}
cooldown.set(userId, Date.now());

// ===== FIND STATION =====
const station = stations.find(s => s.id === interaction.values[0]);
if (!station) return interaction.reply({ content: "❌ محطة غير موجودة", ephemeral: true });

// ===== GET GUILD / CHANNEL =====
const guild = interaction.guild;
const voiceChannel = guild.channels.cache.get(config.RADIO_CHANNEL);

// ===== MOVE USERS =====
await moveUsers(guild, config.RADIO_CHANNEL);

// ===== PLAY =====
await playStream(guild, station, voiceChannel);

currentStation = station.id;

interaction.reply({
content: `🎧 تم تشغيل: **${station.name}**`,
ephemeral: true
});
});

client.login(process.env.DISCORD_TOKEN);
