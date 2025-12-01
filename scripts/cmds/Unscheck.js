const unsendLogs = require("./unsendTracker"); 
// unsendTracker.js hocche main bot er unsend record rakhar file
// jekhane sob user-er unsend messages 5 min store kora hoy

module.exports = {
  config: {
    name: "uns",
    aliases: ["unscheck", "checkuns"],
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Check unsend messages",
    longDescription: "Owner can check what messages a user unsend in last 5 minutes",
    category: "utility",
    guide: "/uns check @mention"
  },

  onStart: async function ({ message, args, event, api }) {
    const ownerID = "100049295749147";
    if (event.senderID != ownerID) 
      return message.reply("You are not the owner");

    if (args[0] !== "check") 
      return message.reply("Invalid command. Use: /uns check @mention");

    const mentionID = event.mentions ? Object.keys(event.mentions)[0] : null;
    if (!mentionID) return message.reply("Please mention a user to check");

    const userLog = unsendLogs[mentionID]?.unsent;
    if (!userLog || userLog.length === 0)
      return message.reply("No unsend messages in last 5 minutes");

    let replyText = `📋 Unsend messages of @${mentionID} in last 5 minutes:\n\n`;
    userLog.forEach((m, i) => {
      replyText += `${i + 1}. ${m.text}\n`;
    });

    return message.reply(replyText);
  }
};
