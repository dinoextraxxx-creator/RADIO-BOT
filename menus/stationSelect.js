const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const stations = require("../config/stations");

module.exports = () => {

const menu = new StringSelectMenuBuilder()
.setCustomId("radio_select")
.setPlaceholder("🎧 اختر محطة الراديو");

stations.forEach(station => {
menu.addOptions(
new StringSelectMenuOptionBuilder()
.setLabel(station.name)
.setValue(station.id)
);
});

return new ActionRowBuilder().addComponents(menu);
};
