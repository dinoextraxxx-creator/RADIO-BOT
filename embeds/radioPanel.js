const { EmbedBuilder } = require("discord.js");

module.exports = () => {
return new EmbedBuilder()
.setColor("#FFD700")
.setTitle("📻 Radio Control Panel")
.setDescription(`
🎧 اختر محطة للاستماع

📺 الجزيرة  
🎙 البودكاست  
📻 القرآن الكريم  

⏳ تغيير المحطة متاح كل 60 ثانية
`)
.setFooter({ text: "Radio System • Live Control" });
};
