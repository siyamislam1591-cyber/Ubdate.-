module.exports = {
  config: {
    name: "reactReply",
    version: "1.0",
    author: "xalman",
    eventType: ["message_reaction"],
    description: "Send 🙂 as a message when someone reacts to bot's message",
  },

  onReaction: async function({ event, api, Threads }) {
    try {
      // বটের আইডি পাওয়া
      const botID = api.getCurrentUserID();

      // চেক করো ইউজার বটের মেসেজে রিয়্যাক্ট দিয়েছে কিনা
      if (event.userID !== botID && event.messageSenderID === botID) {
        // 🙂 ইমোজি পাঠানো
        api.sendMessage("🙂", event.threadID, event.messageID);
      }
    } catch (err) {
      console.log("React reply error:", err);
    }
  }
};
