const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "〲MAYBE NX ";

/**
 * Fully fixed help.js by ChatGPT
 */

module.exports = {
  config: {
    name: "help",
    version: "1.20",
    author: "ntkhang • Fixed by xalman",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage" },
    longDescription: { en: "View command usage" },
    category: "info",
    guide: {
      en:
        "{pn} [page]" +
        "\n{pn} <command name>" +
        "\n{pn} <command> [-u | usage]" +
        "\n{pn} <command> [-i | info]" +
        "\n{pn} <command> [-a | alias]" +
        "\n{pn} <command> [-r | role]"
    },
    priority: 1
  },

  langs: {
    en: {
      help:
        "╭───────────⦿\n%1\n✪──────⦿" +
        "\n✪ Page [ %2/%3 ]" +
        "\n│ Currently, The Bot Has %4 Commands" +
        "\n│ Type %5help <page>" +
        "\n│ Type %5help <command>" +
        "\n✪──────⦿" +
        "\n✪ %6\n╰─────────────⦿",

      help2:
        "%1╭──────────⦿\n│ Total cmds:「%2」\n╰─────────────⦿" +
        "\n╭─────────────⦿\n│%4\n╰────────────⦿",

      commandNotFound: `Command "%1" does not exist`,

      getInfoCommand:
        "⦿────── NAME ──────⦿" +
        "\n✪ %1" +
        "\n✪▫INFO▫" +
        "\n✪ Description: %2" +
        "\n✪ Other names: %3" +
        "\n✪ Other names in your group: %4" +
        "\n✪ Version: %5" +
        "\n✪ Role: %6" +
        "\n✪ Time per command: %7s" +
        "\n✪ Author: %8" +
        "\n✪▫USAGE▫" +
        "\n» %9" +
        "\n⦿─────────────────⦿",

      onlyInfo:
        "╭────⦿ INFO ─────⦿" +
        "\n✪ Command name: %1" +
        "\n✪ Description: %2" +
        "\n✪ Other names: %3" +
        "\n✪ Other names in your group: %4" +
        "\n✪ Version: %5" +
        "\n✪ Role: %6" +
        "\n✪ Time per command: %7s" +
        "\n✪ Author: %8" +
        "\n╰─────────────⦿",

      onlyUsage: "╭───⦿ USAGE ─────⦿\n✪ %1\n╰─────────────⦿",

      onlyAlias:
        "╭───⦿ ALIAS ─────⦿" +
        "\n✪ Other names: %1" +
        "\n✪ Other names in your group: %2" +
        "\n╰─────────────⦿",

      onlyRole: "╭────⦿ ROLE ───⦿\n✪ %1\n╰─────────────⦿",

      doNotHave: "Do not have",

      roleText0: "0 (All users)",
      roleText1: "1 (Group admins)",
      roleText2: "2 (Bot admin)",
      roleText0setRole: "0 (Custom set: all users)",
      roleText1setRole: "1 (Custom set: group admins)",

      pageNotFound: "Page %1 does not exist"
    }
  },

  // MAIN FUNCTION
  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const langCode =
      (await threadsData.get(event.threadID, "data.lang")) ||
      global.GoatBot.config.language;

    let customLang = {};
    const pathCustomLang = path.normalize(
      `${process.cwd()}/languages/cmds/${langCode}.js`
    );
    if (fs.existsSync(pathCustomLang)) customLang = require(pathCustomLang);

    const prefix = getPrefix(event.threadID);
    const threadData = await threadsData.get(event.threadID);
    let sortHelp = threadData.settings.sortHelp || "category";
    if (!["category", "name"].includes(sortHelp)) sortHelp = "name";

    const commandName = (args[0] || "").toLowerCase();
    const command =
      commands.get(commandName) || commands.get(aliases.get(commandName));

    // ========== LIST ALL COMMANDS ==========
    if ((!command && !args[0]) || !isNaN(args[0])) {
      const arrayInfo = [];
      let msg = "";

      // SORT BY NAME
      if (sortHelp === "name") {
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 30;

        for (const [name, value] of commands) {
          if (value.config.role > role) continue;

          let describe = name;
          let shortDescription;

          const shortDescCustom = customLang[name]?.shortDescription;
          if (shortDescCustom != undefined)
            shortDescription = checkLangObject(shortDescCustom, langCode);
          else if (value.config.shortDescription)
            shortDescription = checkLangObject(
              value.config.shortDescription,
              langCode
            );

          if (shortDescription)
            describe +=
              ": " +
              cropContent(
                shortDescription.charAt(0).toUpperCase() +
                  shortDescription.slice(1),
                50
              );

          arrayInfo.push({
            data: describe,
            priority: value.priority || 0
          });
        }

        // Sort by priority + name
        arrayInfo.sort((a, b) => b.priority - a.priority);
        arrayInfo.sort((a, b) => a.data.localeCompare(b.data));

        const { allPage, totalPage } = global.utils.splitPage(
          arrayInfo,
          numberOfOnePage
        );

        if (page < 1 || page > totalPage)
          return message.reply(getLang("pageNotFound", page));

        const returnArray = allPage[page - 1] || [];
        const startNumber = (page - 1) * numberOfOnePage + 1;

        msg += returnArray
          .map(
            (item, index) =>
              `✵${index + startNumber}. 「${item.data}」\n`
          )
          .join("");

        return message.reply(
          getLang(
            "help",
            msg,
            page,
            totalPage,
            commands.size,
            prefix,
            doNotDelete
          )
        );
      }

      // SORT BY CATEGORY
      if (sortHelp === "category") {
        for (const [, value] of commands) {
          if (value.config.role > role) continue;
          const cat = value.config.category?.toLowerCase() || "other";

          const existing = arrayInfo.find(
            (item) => item.category === cat
          );
          if (existing) existing.names.push(value.config.name);
          else
            arrayInfo.push({
              category: cat,
              names: [value.config.name]
            });
        }

        arrayInfo.sort((a, b) => a.category.localeCompare(b.category));

        arrayInfo.forEach((data, index) => {
          const title = `╭──⦿【 ${data.category.toUpperCase()} 】`;
          const names = data.names.sort().map((x) => `✧${x}`);
          msg += `${title}\n${names.join(" ")}\n╰────────⦿\n`;
        });

        return message.reply(
          getLang("help2", msg, commands.size, prefix, doNotDelete)
        );
      }
    }

    // ===== COMMAND NOT FOUND =====
    if (!command && args[0]) {
      return message.reply(getLang("commandNotFound", args[0]));
    }

    // ========== SHOW COMMAND INFO ==========
    const configCommand = command.config;
    const formSendMessage = {};

    let guide =
      configCommand.guide?.[langCode] ||
      configCommand.guide?.["en"] ||
      customLang[configCommand.name]?.guide?.[langCode] ||
      customLang[configCommand.name]?.guide?.["en"] ||
      "";

    if (typeof guide === "string") guide = { body: guide };

    const guideBody = guide.body
      .replace(/\{prefix\}|\{p\}/g, prefix)
      .replace(/\{name\}|\{n\}/g, configCommand.name)
      .replace(/\{pn\}/g, prefix + configCommand.name);

    const aliasesString =
      configCommand.aliases?.join(", ") || getLang("doNotHave");
    const aliasesThisGroup =
      threadData.data.aliases?.[configCommand.name]?.join(", ") ||
      getLang("doNotHave");

    let roleOfCommand = configCommand.role;
    let roleIsSet = false;

    if (threadData.data.setRole?.[configCommand.name]) {
      roleOfCommand = threadData.data.setRole[configCommand.name];
      roleIsSet = true;
    }

    const roleText =
      roleOfCommand == 0
        ? roleIsSet
          ? getLang("roleText0setRole")
          : getLang("roleText0")
        : roleOfCommand == 1
        ? roleIsSet
          ? getLang("roleText1setRole")
          : getLang("roleText1")
        : getLang("roleText2");

    let description =
      checkLangObject(configCommand.longDescription, langCode) ||
      customLang[configCommand.name]?.longDescription?.[langCode] ||
      getLang("doNotHave");

    let sendWithAttachment = false;

    // SUBCOMMANDS
    if (args[1]?.match(/^-g|guide|-u|usage$/)) {
      formSendMessage.body = getLang(
        "onlyUsage",
        guideBody.replace(/\n/g, "\n✵")
      );
      sendWithAttachment = true;
    } else if (args[1]?.match(/^-a|alias|aliases$/)) {
      formSendMessage.body = getLang(
        "onlyAlias",
        aliasesString,
        aliasesThisGroup
      );
    } else if (args[1]?.match(/^-r|role$/)) {
      formSendMessage.body = getLang("onlyRole", roleText);
    } else if (args[1]?.match(/^-i|info$/)) {
      formSendMessage.body = getLang(
        "onlyInfo",
        configCommand.name,
        description,
        aliasesString,
        aliasesThisGroup,
        configCommand.version,
        roleText,
        configCommand.countDown || 1,
        configCommand.author || ""
      );
    } else {
      formSendMessage.body = getLang(
        "getInfoCommand",
        configCommand.name,
        description,
        aliasesString,
        aliasesThisGroup,
        configCommand.version,
        roleText,
        configCommand.countDown || 1,
        configCommand.author || "",
        guideBody.replace(/\n/g, "\n»")
      );
      sendWithAttachment = true;
    }

    // ATTACHMENTS
    if (sendWithAttachment && guide.attachment) {
      formSendMessage.attachment = [];

      for (const keyPath in guide.attachment) {
        const filePath = path.normalize(keyPath);

        if (!fs.existsSync(filePath)) {
          const dir = path.dirname(filePath);
          fs.ensureDirSync(dir);

          const buffer = (
            await axios.get(guide.attachment[keyPath], {
              responseType: "arraybuffer"
            })
          ).data;

          fs.writeFileSync(filePath, Buffer.from(buffer));
        }

        formSendMessage.attachment.push(fs.createReadStream(filePath));
      }
    }

    return message.reply(formSendMessage);
  }
};

// Utility functions
function checkLangObject(data, langCode) {
  if (typeof data === "string") return data;
  if (typeof data === "object") return data[langCode] || data.en;
  return undefined;
}

function cropContent(content, max = 50) {
  if (content.length > max) return content.slice(0, max - 3) + "...";
  return content;
        }
