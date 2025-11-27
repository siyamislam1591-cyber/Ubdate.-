module.exports = {
  config: {
    name: "top",
    version: "2.0",
    author: "siyuu",
    role: 0,
    shortDescription: { en: "Show Top Richest Users" },
    longDescription: { en: "" },
    category: "group",
    guide: { en: "{pn}top 10" }
  },

  onStart: async function ({ api, args, message, event, usersData }) {

    // User input number (default = 10)
    const limit = args[0] ? parseInt(args[0]) : 10;
    if (isNaN(limit) || limit <= 0) return message.reply("❗ Please enter a valid number.");

    const allUsers = await usersData.getAll();

    // Sort users by money
    const sortedUsers = allUsers.sort((a, b) => (b.money || 0) - (a.money || 0)).slice(0, limit);

    // Format number in K/M/B/T/Q
    function formatNumber(num) {
      if (num >= 1e15) return (num / 1e15).toFixed(2) + "Q";
      if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
      if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
      if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
      if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
      return num.toFixed(2);
    }

    // Rank Icons
    const icons = {
      1: "👑",
      2: "🥈",
      3: "🥉"
    };

    const normalIcons = ["🔶", "🔷"];

    // Create list
    let list = "";
    sortedUsers.forEach((user, index) => {
      const rank = index + 1;
      const icon = icons[rank] || normalIcons[index % 2];
      const moneyText = formatNumber(user.money || 0);

      list += `${icon} 𝗥𝗮𝗻𝗸 ${rank}: ${user.name}\n💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${moneyText}\n\n`;
    });

    const finalMessage = `🏆 𝗧𝗢𝗣 ${limit} 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦
━━━━━━━━━━━━━━━━━━
${list}━━━━━━━━━━━━━━━━━━
💡 Example: {p}top 5  or  {p}top 20`;

    message.reply(finalMessage);
  }
};
