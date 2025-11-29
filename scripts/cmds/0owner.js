const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "owner",
    aliases: ["info", "admininfo", "ownerinfo"],
    version: "2.4",
    author: "Shahariya Ahmed Siyam (Siyuu) 🌟",
    longDescription: {
      en: "Info about bot and its owner"
    },
    category: "Special",
    guide: {
      en: "{p}owner or just type owner"
    },
    usePrefix: false
  },

  onStart: async function (context) {
    await module.exports.sendOwnerInfo(context);
  },

  onChat: async function ({ event, message, usersData }) {
    const prefix = global.GoatBot.config.prefix;
    const body = (event.body || "").toLowerCase().trim();
    const triggers = ["owner", `${prefix}owner`];
    if (!triggers.includes(body)) return;
    await module.exports.sendOwnerInfo({ event, message, usersData });
  },

  sendOwnerInfo: async function ({ event, message, usersData }) {
    const videoURL = "https://files.catbox.moe/beh7nq.mp4";

    let attachment = null;
    try {
      if (videoURL && videoURL.startsWith("http")) {
        attachment = await getStreamFromURL(videoURL);
      }
    } catch (err) {
      console.warn("⚠️ Video fetch failed, sending text only:", err.message);
    }

    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name || "User";
    const mentions = [{ id, tag: name }];

    const info = `
🌟✨ 𝗢𝘄𝗻𝗲𝗿 𝗜𝗻𝗳𝗼 ✨🌟
💠 𝗡𝗮𝗺𝗲:       Shahariya Ahmed Siyam (Siyuu)
🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲:   ♡Maiko♡
🎉 𝗔𝗴𝗲:        -+
🧠 𝗖𝗹𝗮𝘀𝘀:      -+
💖 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻:   Single
♂️ 𝗚𝗲𝗻𝗱𝗲𝗿:     Male
🏡 𝗙𝗿𝗼𝗺:       Mymensingh
💬 𝗠𝗲𝘀𝘀𝗲𝗻𝗴𝗲𝗿: Ahammed siyam 

🎈 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗯𝗼𝘁 ! Enjoy 🌈
    `.trim();

    const msgData = {
      body: info,
      mentions
    };

    if (attachment) msgData.attachment = attachment;

    message.reply(msgData);
  }
};
