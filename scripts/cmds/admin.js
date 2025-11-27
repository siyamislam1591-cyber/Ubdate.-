const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
config: {
    name: "admin",
    version: "2.0",
    author: "xalman + updated by chatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "admin system" },
    longDescription: { en: "Add/remove admin (only owner), list admin (everyone)" },
    category: "box chat",
    guide: {
        en: '{pn} add <uid/@tag>\n{pn} remove <uid/@tag>\n{pn} list'
    }
},

langs: {
    en: {
        added: "✅ | Added admin for %1 users:\n%2",
        alreadyAdmin: "\n⚠️ | %1 users already admin:\n%2",
        missingIdAdd: "⚠️ | Please enter ID or tag user to add",
        removed: "✅ | Removed admin for %1 users:\n%2",
        notAdmin: "⚠️ | %1 users are not in admin list:\n%2",
        missingIdRemove: "⚠️ | Please enter ID or tag user to remove",
        listAdmin: "👑 | Admin list:\n%1"
    }
},

onStart: async function ({ message, args, usersData, event, getLang }) {
    
    const senderID = event.senderID;

    // ===== OWNER UID only =====
    const OWNER = "100049295749147"; 

    switch (args[0]) {

        // ==========================
        //          ADD ADMIN
        // ==========================
        case "add":
        case "-a": {

            if (senderID !== OWNER)
                return message.reply("❌ | Only Owner can add admin.");

            if (!args[1])
                return message.reply(getLang("missingIdAdd"));

            let uids = [];
            if (Object.keys(event.mentions).length > 0)
                uids = Object.keys(event.mentions);
            else if (event.messageReply)
                uids.push(event.messageReply.senderID);
            else
                uids = args.filter(arg => !isNaN(arg));

            const notAdmin = [];
            const already = [];

            for (const uid of uids) {
                if (config.adminBot.includes(uid))
                    already.push(uid);
                else
                    notAdmin.push(uid);
            }

            config.adminBot.push(...notAdmin);

            const names = await Promise.all(
                uids.map(uid => 
                    usersData.getName(uid).then(name => ({ uid, name }))
                )
            );

            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            return message.reply(
                (notAdmin.length > 0 ? getLang(
                    "added",
                    notAdmin.length,
                    names.filter(n => notAdmin.includes(n.uid))
                         .map(i => `• ${i.name} (${i.uid})`).join("\n")
                ) : "")
                +
                (already.length > 0 ? getLang(
                    "alreadyAdmin",
                    already.length,
                    already.map(uid => `• ${uid}`).join("\n")
                ) : "")
            );
        }

        // ==========================
        //        REMOVE ADMIN
        // ==========================
        case "remove":
        case "-r": {

            if (senderID !== OWNER)
                return message.reply("❌ | Only Owner can remove admin.");

            if (!args[1])
                return message.reply(getLang("missingIdRemove"));

            let uids = [];
            if (Object.keys(event.mentions).length > 0)
                uids = Object.keys(event.mentions);
            else if (event.messageReply)
                uids.push(event.messageReply.senderID);
            else
                uids = args.filter(arg => !isNaN(arg));

            const adminIds = [];
            const notAdmin = [];

            for (const uid of uids) {
                if (config.adminBot.includes(uid))
                    adminIds.push(uid);
                else
                    notAdmin.push(uid);
            }

            for (const uid of adminIds)
                config.adminBot.splice(config.adminBot.indexOf(uid), 1);

            const names = await Promise.all(
                adminIds.map(uid =>
                    usersData.getName(uid).then(name => ({ uid, name }))
                )
            );

            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            return message.reply(
                (adminIds.length > 0 ? getLang(
                    "removed",
                    adminIds.length,
                    names.map(i => `• ${i.name} (${i.uid})`).join("\n")
                ) : "")
                +
                (notAdmin.length > 0 ? getLang(
                    "notAdmin",
                    notAdmin.length,
                    notAdmin.map(uid => `• ${uid}`).join("\n")
                ) : "")
            );
        }

        // ==========================
        //          LIST ADMIN
        // ==========================
        case "list":
        case "-l": {

            const names = await Promise.all(
                config.adminBot.map(uid =>
                    usersData.getName(uid).then(name => ({ uid, name }))
                )
            );

            const ownerList = `
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃       🧾 [ ALL ADMINS ]       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛

👑 𝗢𝗪𝗡𝗘𝗥(S):
• Ahammed Siyam (100049295749147)
• Spa Rrow (61576567185513)

💫 𝗔𝗗𝗠𝗜𝗡𝗦:
${names.length > 0
    ? names.map(i => `• ${i.name} (${i.uid})`).join("\n")
    : "• No Admin Found"}

━━━━━━━━━━━━━━━━━━━━━━━
🔒 Only Owner can use → admin add / remove`;

            return message.reply(ownerList);
        }

        default:
            return message.SyntaxError();
    }
}
};
