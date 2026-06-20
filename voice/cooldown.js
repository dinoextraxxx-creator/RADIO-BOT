const fs = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, "../data/state.json");
const { COOLDOWN_MS } = require("../config/settings");

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch (e) {
    return { currentStation: null, lastChange: 0, changedBy: null };
  }
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (e) {
    console.log("State save error:", e.message);
  }
}

function canChange() {
  const state = loadState();
  return Date.now() - state.lastChange >= COOLDOWN_MS;
}

function remainingSeconds() {
  const state = loadState();
  const remaining = COOLDOWN_MS - (Date.now() - state.lastChange);
  return Math.ceil(remaining / 1000);
}

function recordChange(stationKey, userId) {
  saveState({
    currentStation: stationKey,
    lastChange: Date.now(),
    changedBy: userId
  });
}

function getState() {
  return loadState();
}

module.exports = { canChange, remainingSeconds, recordChange, getState };
