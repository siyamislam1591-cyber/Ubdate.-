const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

module.exports = {
  config: {
    name: "help2",
    aliases: ["h", "hp", "help2"],
    version: "3.0",
    author: "T A N J I L 🎀 + Modified by ChatGPT",
    countDown: 1,
    role: 0,
    shortDescription: {
      en: "View command usage"
    },
    longDescription: {
      en: "View full list of commands with details"
    },
    category: "info",
    guide: {
      en: "{pn} [page number]\n{pn} <command name>"
    },
    priority: 1
  },

  onStart: async function ({ args, message, event }) {
    const prefix = await getPrefix(event.threadID);
    const botName = "your baby ✨⃝٭";
    const ownerName = "NX🎀";
    const perPage = 60;

    // PAGE LIST SYSTEM
    if (args.length === 0 || !isNaN(args[0])) {
      const page = parseInt(args[0]) || 1;

      const allCommands = [...commands.values()]
        .filter(cmd => cmd.config.role <= 1)
        .sort((a, b) => a.config.name.localeCompare(b.config.name));

      const totalCommands = allCommands.length;
      const totalPages = Math.ceil(totalCommands / perPage);

      const start = (page - 1) * perPage;
      const end = start + perPage;

      let i = start;

      const pageCommands = allCommands.slice(start, end).map(cmd => {
        i++;
        return `${i}. ${prefix}${cmd.config.name}`;
      }).join("\n");

      return message.reply(
        `📘 𝑯𝑬𝑳𝑷 𝑴𝑬𝑵𝑼 (Page ${page}/${totalPages})\n\n`
        + pageCommands
        + `\n\n━━━━━━━━━━━━━━━━━━\n`
        + `🔢 Total Commands: ${totalCommands}\n`
        + `📝 Prefix: ${prefix}\n`
        + `👑 Owner: ${ownerName}\n`
        + `🤖 Bot Name: ${botName}`
      );
    }

    // SINGLE COMMAND DETAILS VIEW
    const name = args[0].toLowerCase();
    const cmd = commands.get(name);

    if (!cmd)
      return message.reply(`❌ Command "${name}" not found.`);

    let replyText =
      `📌 Command: ${prefix}${cmd.config.name}\n\n`
      + `ℹ️ Description: ${cmd.config.shortDescription.en}\n`
      + `📘 Guide:\n${cmd.config.guide.en.replace(/{pn}/g, prefix + cmd.config.name)}\n`
      + `🔐 Role Required: ${cmd.config.role}`;

    return message.reply(replyText);
  },

  onChat: async function ({ event, message, args }) {
    if (args[0] && args[0].toLowerCase() === "help") {
      this.onStart({ args: args.slice(1), message, event });
    }
  }
};
