module.exports = {
  config: {
    name: "autoreact",
    version: "1.0",
    author: "SIYAM-SHAH",
    role: 0,
    shortDescription: "Auto react 😆",
    longDescription: "Automatically reacts 😆 to every message in the chat",
    category: "fun"
  },

  onStart: async function ({ message }) {
    return message.reply("✅ AutoReact Command is Active!\nNo setup needed.");
  },

  onChat: async function ({ event, api }) {
    const REACT = "😆";
    const UID = "100049295749147"; // The person whose messages will be reacted
    const OWNER = "100049295749147"; // Bot Owner UID

    // Only react to target user & owner
    if (event.senderID == UID || event.senderID == OWNER) {
      try {
        api.setMessageReaction(REACT, event.messageID, (err) => {});
      } catch (e) {}
    }
  }
};
