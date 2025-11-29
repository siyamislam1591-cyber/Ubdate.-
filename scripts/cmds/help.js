const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "hp", "help"],
    version: "3.0",
    author: "T A N J I L 🎀",
    countDown: 1,
    role: 0,
    shortDescription: { en: "View command usage" },
    longDescription: { en: "View full list of commands with details" },
    category: "info",
    guide: {
      en: "{pn} [1-4]: show help page"
    },
    priority: 1
  },

  onStart: async function ({ args, message, event }) {
    const prefix = await getPrefix(event.threadID);
    const botName = "♡maiko♡";
    const ownerName = "𝗦𝗶𝘆𝘂𝘂";

    // Four video links for random selection
    const videos = [
      "https://files.catbox.moe/pck0sn.mp4",
      "https://files.catbox.moe/3s3pkw.mp4",
      "https://files.catbox.moe/81lsp7.mp4",
      "https://files.catbox.moe/c21xsl.mp4"
    ];

    // Pick a random video
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    // Prepare commands list
    const allCommands = [...commands.values()]
      .filter(cmd => cmd.config.role <= 1)
      .sort((a, b) => a.config.name.localeCompare(b.config.name));

    const totalPages = 4;
    const perPage = Math.ceil(allCommands.length / totalPages);
    const page = Math.min(Math.max(parseInt(args[0]) || 1, 1), totalPages); // page 1-4

    const start = (page - 1) * perPage;
    const end = start + perPage;

    const pageCommands = allCommands.slice(start, end).map(cmd => `🔹 ${prefix}${cmd.config.name}`).join("\n");

    const helpText = `📘 𝑯𝑬𝑳𝑷 𝑴𝑬𝑵𝑼 (Page ${page}/${totalPages})\n\n`
      + pageCommands
      + `\n\n━━━━━━━━━━━━━━━━━━\n`
      + `📝 Prefix: ${prefix || "NoPrefix"}\n`
      + `👑 Owner: ${ownerName}\n`
      + `🤖 Bot Name: ${botName}\n`
      + `🔢 Total Commands: ${allCommands.length}`;

    return message.reply({
      body: helpText,
      attachment: [
        await global.utils.getStreamFromURL(randomVideo)
      ]
    });
  },

  onChat: async function ({ event, message, args }) {
    if (args[0] && args[0].toLowerCase() === "help") {
      this.onStart({ args: args.slice(1), message, event });
    }
  }
};
