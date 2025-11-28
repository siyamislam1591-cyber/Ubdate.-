const { findUid } = global.utils;
const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
  config: {
    name: "uid",
    version: "2.0",
    author: "Edited by ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send UID card image" },
    longDescription: { en: "Generate an image containing user's name & uid, with wait message + unsent." },
    category: "info"
  },

  onStart: async function({ message, event, args }) {
    // 1️⃣ First message → WAIT
    const waitMsg = await message.reply("⏳ Wait koro baby…");

    // 2️⃣ Unsend after 2 seconds
    setTimeout(() => {
      message.unsend(waitMsg.messageID);
    }, 2000);

    try {
      let targetId = null;
      let targetName = null;

      // reply case
      if (event.messageReply) {
        targetId = event.messageReply.senderID;
      }

      // mention case
      if (!targetId && event.mentions && Object.keys(event.mentions).length) {
        const first = Object.keys(event.mentions)[0];
        targetId = first;
        targetName = event.mentions[first].replace("@", "");
      }

      // profile link case
      if (!targetId && args[0] && args[0].match(regExCheckURL)) {
        targetId = await findUid(args[0]);
      }

      // default: own uid
      if (!targetId) targetId = event.senderID;

      // fetch name
      try {
        if (global.api && global.api.getUserInfo) {
          const info = await global.api.getUserInfo([targetId]);
          targetName = info[targetId].name || "Unknown";
        }
      } catch (e) {
        if (!targetName) targetName = "Unknown";
      }

      // --------------------------
      // 3️⃣ GENERATE MODERN IMAGE
      // --------------------------

      const width = 1000;
      const height = 500;

      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Sexy gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f0c29");
      gradient.addColorStop(0.5, "#302b63");
      gradient.addColorStop(1, "#24243e");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Big glowing box
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      rounded(ctx, 60, 60, width - 120, height - 120, 35);
      ctx.fill();

      // Title
      ctx.fillStyle = "#fff";
      ctx.font = "bold 50px Sans";
      ctx.fillText("USER INFORMATION", 80, 150);

      // Name
      ctx.font = "bold 42px Sans";
      ctx.fillStyle = "#f2f2f2";
      ctx.fillText("Name:", 80, 250);

      ctx.font = "bold 48px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(targetName, 80, 310);

      // UID
      ctx.font = "bold 42px Sans";
      ctx.fillStyle = "#f2f2f2";
      ctx.fillText("UID:", 80, 380);

      ctx.font = "bold 48px Sans";
      ctx.fillStyle = "#00ffea";
      ctx.fillText(targetId, 80, 440);

      // Save file
      const folder = path.join(__dirname, "cache");
      await fs.ensureDir(folder);
      const imgPath = path.join(folder, `uid_${targetId}_${Date.now()}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer());

      // Send image only
      await message.reply({
        attachment: fs.createReadStream(imgPath)
      });

      // Delete temp file
      setTimeout(() => fs.unlink(imgPath).catch(() => {}), 3000);

    } catch (error) {
      message.reply("Error baby 😿");
    }
  }
};

// helper rounded box
function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
