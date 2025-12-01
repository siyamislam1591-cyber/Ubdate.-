// joinleave.js
module.exports = {
  config: {
    name: "joinleave",
    version: "1.2",
    author: "Xalman & ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Welcome and leave detector",
    longDescription: "Shows a message when someone joins or leaves the group",
    category: "system"
  },

  // বাধ্যতামূলক onStart
  onStart: async function({ message }) {
    message.reply("✅ Join/Leave detector is now active!");
  },

  // মূল ইভেন্ট হ্যান্ডলার
  onEvent: async function({ event, api, Users }) {
    try {
      const threadID = event.threadID || event.threadId;

      // ===== MEMBER LEAVE =====
      if (
        event.logMessageType === "log:unsubscribe" ||
        event.type === "log:unsubscribe"
      ) {
        let leftId =
          event.leftParticipantFbId ||
          event.logMessageData?.leftParticipantFbId ||
          event.leftParticipantFbIds?.[0];
        if (!leftId) return;

        let name = "Unknown";
        try {
          if (Users && typeof Users.getName === "function") {
            name = await Users.getName(leftId);
          } else {
            const info = await api.getUserInfo(leftId);
            name = info[leftId]?.name || "Unknown";
          }
        } catch (e) {}

        const msg = ` ${name}\n left the group `;
        return api.sendMessage(msg, threadID);
      }
    } catch (err) {
      console.error("Join/Leave error:", err);
    }
  }
};
