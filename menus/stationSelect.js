const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const stations = require("../config/stations");

function buildStationMenu() {
  const options = Object.entries(stations).map(([key, s]) => ({
    label: s.label,
    value: key,
    emoji: s.emoji
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId("station_select")
    .setPlaceholder("اختر محطة...")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

module.exports = { buildStationMenu };
