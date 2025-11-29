const { findUid } = global.utils;
const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
  config: {
    name: "uid",
    version: "5.0",
    author: "Edited by ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "UID card image + UID text" },
    longDescription: { en: "Generates modern image containing name + uid AND sends UID text." },
    category: "info"
  },

  onStart: async function ({ message, event, args }) {
    const waitMsg = await message.reply("⏳ Wait baby…");

    setTimeout(() => {
      message.unsend(waitMsg.messageID);
    }, 2000);

    try {
      let targetId = null;
      let targetName = null;

      // Reply
      if (event.messageReply) {
        targetId = event.messageReply.senderID;
      }

      // Mention
      if (!targetId && event.mentions && Object.keys(event.mentions).length) {
        const first = Object.keys(event.mentions)[0];
        targetId = first;
        targetName = event.mentions[first].replace("@", "");
      }

      // Link
      if (!targetId && args[0] && args[0].match(regExCheckURL)) {
        targetId = await findUid(args[0]);
      }

      // Self
      if (!targetId) targetId = event.senderID;

      // Name
      try {
        if (global.api && global.api.getUserInfo) {
          const info = await global.api.getUserInfo([targetId]);
          targetName = info[targetId].name || "Unknown";
        }
      } catch {
        if (!targetName) targetName = "Unknown";
      }

      // IMAGE GENERATE
      const width = 1000;
      const height = 500;

      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f0c29");
      gradient.addColorStop(0.5, "#302b63");
      gradient.addColorStop(1, "#24243e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Card
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      rounded(ctx, 60, 60, width - 120, height - 120, 35);
      ctx.fill();

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 55px Sans";
      ctx.fillText("Name:", 80, 200);

      ctx.fillStyle = "#00ffea";
      ctx.font = "bold 65px Sans";
      ctx.fillText(targetName, 80, 270);

      // UID
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 55px Sans";
      ctx.fillText("UID:", 80, 370);

      ctx.fillStyle = "#00eaff";
      ctx.font = "bold 70px Sans";
      ctx.fillText(targetId, 80, 440);

      // Save file
      const folder = path.join(__dirname, "cache");
      await fs.ensureDir(folder);
      const imgPath = path.join(folder, `uid_${targetId}_${Date.now()}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer());

      // Send Image + Text(UID)
      await message.reply({
        body: `🆔 UID: ${targetId}`,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => fs.unlink(imgPath).catch(() => { }), 3000);

    } catch (error) {
      message.reply("😿 Error baby…");
    }
  }
};

// rounded rectangle
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
