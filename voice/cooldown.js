let lastChange = 0;

function canChange() {
  const { COOLDOWN_MS } = require("../config/settings");
  return Date.now() - lastChange >= COOLDOWN_MS;
}

function remainingSeconds() {
  const { COOLDOWN_MS } = require("../config/settings");
  const remaining = COOLDOWN_MS - (Date.now() - lastChange);
  return Math.ceil(remaining / 1000);
}

function recordChange() {
  lastChange = Date.now();
}

module.exports = { canChange, remainingSeconds, recordChange };
