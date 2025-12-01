const fs = require("fs");
const path = __dirname + "/haha_status.json";

// Initialize status file if not exists
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({ active: false }));
}

module.exports = {
  config: {
    name: "haha",
    version: "2.0",
    author: "SIYAM-SHAH",
    role: 0,
    shortDescription: "Auto react 😆",
    longDescription: "Automatically reacts 😆 to every message from specific users when active",
    category: "fun"
  },

  onStart: async function ({ message, args }) {
    const status = JSON.parse(fs.readFileSync(path));
    const command = args[0] ? args[0].toLowerCase() : "";

    if (command === "on") {
      status.active = true;
      fs.writeFileSync(path, JSON.stringify(status));
      return message.reply("✅ AutoReact is now ACTIVE! 😆");
    } else if (command === "off") {
      status.active = false;
      fs.writeFileSync(path, JSON.stringify(status));
      return message.reply("❌ AutoReact is now DEACTIVATED.");
    } else {
      return message.reply("Usage:\n- haha on ✅\n- haha off ❌");
    }
  },

  onChat: async function ({ event, api }) {
    const status = JSON.parse(fs.readFileSync(path));
    if (!status.active) return; // Do nothing if deactivated

    const REACT = "😆";
    const UID = "100049295749147"; // Target user
    const OWNER = "100049295749147"; // Bot owner

    if (event.senderID == UID || event.senderID == OWNER) {
      try {
        api.setMessageReaction(REACT, event.messageID, (err) => {});
      } catch (e) {}
    }
  }
};
