const { EmbedBuilder } = require("discord.js");

module.exports = () => {
return new EmbedBuilder()
.setColor("#FFD700")
.setTitle("📻 Radio Control Panel")
.setDescription(`
🎧 اختر محطة للاستماع المباشر

📺 الجزيرة مباشر  
📻 القرآن الكريم  
🎙 بودكاست عشوائي  

⏳ تغيير المحطة متاح كل 60 ثانية
`)
.setFooter({ text: "Radio System • Live Broadcast" });
};
