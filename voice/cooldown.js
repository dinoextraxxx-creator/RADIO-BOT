const cooldown = new Map();

function checkCooldown(userId, time) {
const last = cooldown.get(userId);

if (last && Date.now() - last < time * 1000) {
return false;
}

cooldown.set(userId, Date.now());
return true;
}

module.exports = {
checkCooldown
};
