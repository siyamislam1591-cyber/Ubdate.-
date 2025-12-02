const fs = require("fs-extra");
const { utils } = global;

module.exports = {
    config: {
        name: "prefix",
        version: "1.5",
        author: "NTKhang | Modified by siyuuuu",
        countDown: 5,
        role: 0,
        description: "Change or view prefix",
        category: "config",
        guide: {
            en: "   {pn} <new prefix>"
        }
    },

    langs: {
        en: {
            reset: "Your prefix has been reset to default: %1",
            onlyAdmin: "Only admin can change prefix of system bot",
            confirmGlobal: "Please react to confirm changing global prefix",
            confirmThisThread: "Please react to confirm changing chat prefix",
            successGlobal: "Changed global prefix to: %1",
            successThisThread: "Changed prefix in this chat to: %1",

            // 🔥 NEW PREFIX STYLE MESSAGE
            myPrefix:
`👋 𝐇𝐞𝐲 %1 𝐝𝐢𝐝 𝐲𝐨𝐮 𝐚𝐬𝐤 𝐟𝐨𝐫 𝐦𝐲 𝐩𝐫𝐞𝐟𝐢𝐱?
➥ 🌐 𝐆𝐥𝐨𝐛𝐚𝐥: %2
➥ 💬 𝐓𝐡𝐢𝐬 𝐂𝐡𝐚𝐭: %3
𝐈'𝐦 ‌♡𝗺𝗮𝗶𝗸𝗼♡ , 𝐧𝐢𝐜𝐞 𝐭𝐨 𝐦𝐞𝐞𝐭 𝐲𝐨𝐮!`
        }
    },

    onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
        if (!args[0])
            return message.SyntaxError();

        if (args[0] == 'reset') {
            await threadsData.set(event.threadID, null, "data.prefix");
            return message.reply(getLang("reset", global.GoatBot.config.prefix));
        }

        const newPrefix = args[0];
        const formSet = { commandName, author: event.senderID, newPrefix };

        if (args[1] === "-g") {
            if (role < 2)
                return message.reply(getLang("onlyAdmin"));
            else formSet.setGlobal = true;
        }
        else formSet.setGlobal = false;

        return message.reply(
            args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"),
            (err, info) => {
                formSet.messageID = info.messageID;
                global.GoatBot.onReaction.set(info.messageID, formSet);
            }
        );
    },

    onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
        const { author, newPrefix, setGlobal } = Reaction;
        if (event.userID !== author) return;

        if (setGlobal) {
            global.GoatBot.config.prefix = newPrefix;
            fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
            return message.reply(getLang("successGlobal", newPrefix));
        }
        else {
            await threadsData.set(event.threadID, newPrefix, "data.prefix");
            return message.reply(getLang("successThisThread", newPrefix));
        }
    },

    onChat: async function ({ event, message, getLang }) {
        if (event.body && event.body.toLowerCase() === "prefix") {
            const userName = global.data.userName.get(event.senderID) || "User";
            const globalPrefix = global.GoatBot.config.prefix;
            const threadPrefix = utils.getPrefix(event.threadID);
            const botName = global.GoatBot.config.nickName || "GoatBot";

            return message.reply(
                getLang("myPrefix", userName, globalPrefix, threadPrefix, botName)
            );
        }
    }
};
