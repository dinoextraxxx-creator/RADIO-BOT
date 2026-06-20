const { EmbedBuilder } = require("discord.js");
const { ICON_URL } = require("../config/settings");
const stations = require("../config/stations");

function buildRadioEmbed({ currentStationKey, changedBy, status }) {
  const station = currentStationKey ? stations[currentStationKey] : null;

  const embed = new EmbedBuilder()
    .setColor("#1ABC9C")
    .setAuthor({
      name: 'محطة "يونكو" للراديو 🔘',
      iconURL: ICON_URL
    })
    .setTitle(
      "**اخـــتــر مــــحـــطـــة الاســــتمـــاع التـــي تــفـضــلـها 🎧 :**"
    )
    .setDescription(
      station
        ? `**المحطة الحالية:** ${station.emoji} ${station.label}\n**الحالة:** ${
            status || "🟢 يعمل"
          }\n**آخر تغيير بواسطة:** ${
            changedBy ? `<@${changedBy}>` : "—"
          }`
        : "لا توجد محطة قيد التشغيل حالياً."
    )
    .setFooter({
      text: 'محطة "يونكو" للراديو 🔘',
      iconURL: ICON_URL
    })
    .setTimestamp();

  return embed;
}

module.exports = { buildRadioEmbed };
