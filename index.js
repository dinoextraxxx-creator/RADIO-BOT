const { Client, GatewayIntentBits, Events } = require("discord.js");

const config = require("./config/channels");
const settings = require("./config/settings");

const radioPanel = require("./embeds/radioPanel");
const stationMenu = require("./menus/stationSelect");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildVoiceStates
]
});

// نخزن رسالة اللوحة حتى لا تتكرر
let panelMessage = null;

client.once(Events.ClientReady, async () => {
console.log(`Logged in as ${client.user.tag}`);

const channel = await client.channels.fetch(config.SELECTION_CHANNEL);

// إذا اللوحة موجودة لا نعيد إرسالها
const messages = await channel.messages.fetch({ limit: 10 });
const exists = messages.find(m => m.author.id === client.user.id);

if (!exists) {
const embed = radioPanel();
const menu = stationMenu();

panelMessage = await channel.send({
embeds: [embed],
components: [menu]
});

console.log("Radio panel sent.");
} else {
console.log("Radio panel already exists.");
}
});

// استقبال الاختيارات (لاحقاً سنكمل الصوت هنا)
client.on(Events.InteractionCreate, async (interaction) => {
if (!interaction.isStringSelectMenu()) return;

if (interaction.customId === "radio_select") {
await interaction.reply({
content: "🎧 تم اختيار المحطة... جاري التشغيل",
ephemeral: true
});

// هنا لاحقاً نضيف:
// - الكولداون
// - نقل المستخدمين
// - تشغيل الصوت
}
});

client.login(process.env.DISCORD_TOKEN);
