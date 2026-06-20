const { EmbedBuilder } = require("discord.js");

module.exports = () => {
return new EmbedBuilder()
.setColor("#FFD700")
.setTitle("📻 RADIO SYSTEM")
.setDescription(`
🎧 اختر محطة للاستماع المباشر

📺 الجزيرة مباشر  
📻 القرآن الكريم  
🎙 بودكاست عشوائي  

──────────────────

🔊 الحالة:
🟢 النظام جاهز للبث

⏳ الكولداون: 60 ثانية
`)
.setFooter({ text: "Radio System • Live Audio Streaming" });
};
