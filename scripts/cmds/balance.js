const { config } = global.GoatBot;
const Canvas = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "2.0.0",
    author: "Nazrul (edited)",
    countDown: 1,
    role: 0,
    description: "View, transfer, request, or add/delete money (animated balance card)",
    category: "economy",
    guide: { en: `
      {pn}: help to view cmds guide
      {pn}: view your balance (sends animated card)
      {pn} <@tag>: view the balance of the tagged person (card)
      {pn} transfer <@tag>/<UID>/<reply> <amount>: transfer money
      {pn} request <amount>: request money from the admin
      {pn} add <@tag>/<UID>/<reply> <amount>: admin adds money
      {pn} delete <@tag>/<UID>/<reply> <amount>: admin deletes money` }
  },

  onStart: async function ({ message, usersData, event, args, api }) {
    const senderID = event.senderID;
    const allowedUIDs = Array.isArray(config.adminBot) ? config.adminBot : [config.adminBot];

    const formatMoney = (num) => {
      const units = ["", "K", "M", "B", "T"];
      let unit = 0;
      let number = Number(num) || 0;
      while (number >= 1000 && unit < units.length - 1) {
        number /= 1000;
        unit++;
      }
      return `${number.toFixed(2)}${units[unit]}`;
    };

    const isValidAmount = (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0 && isFinite(num);
    };

    const getTargetUID = () => {
      if (event.messageReply) return event.messageReply.senderID;
      if (event.mentions && Object.keys(event.mentions).length) return Object.keys(event.mentions)[0];
      // if a plain UID passed as first argument (or second depending on subcommand)
      const maybe = args.find(a => !!a && !isNaN(a));
      if (maybe) return maybe;
      return null;
    };

    const getAmount = () => args[args.length - 1];

    // HELP
    if (args[0] === "help") {
      return message.reply(
        `1. ${config.prefix}balance -> view your balance (animated card)\n` +
        `2. ${config.prefix}balance <@tag> -> view another user's balance (card)\n` +
        `3. ${config.prefix}balance transfer <UID/@tag/reply> <amount>\n` +
        `4. ${config.prefix}balance request <amount>\n` +
        `5. ${config.prefix}balance add <UID/@tag/reply> <amount> (admin)\n` +
        `6. ${config.prefix}balance delete <UID/@tag/reply> <amount> (admin)`
      );
    }

    // ADD (admin)
    if (args[0] === "add") {
      if (!allowedUIDs.includes(senderID)) return message.reply("❌ You don't have permission to use this command.");
      const targetUID = getTargetUID();
      const amount = getAmount();
      if (!targetUID) return message.reply("❌ Could not identify the user. Tag, reply, or provide a valid UID.");
      if (!isValidAmount(amount)) return message.reply("❌ Please provide a valid positive amount.");
      const userData = (await usersData.get(targetUID)) || { money: "0", name: "Unknown User" };
      const newBalance = (Number(userData.money) + Number(amount)).toString();
      await usersData.set(targetUID, { ...userData, money: newBalance });
      return message.reply(`✅ Successfully added ${formatMoney(amount)}$ to ${userData.name || "User"} (UID: ${targetUID}).`);
    }

    // DELETE (admin)
    if (args[0] === "delete") {
      if (!allowedUIDs.includes(senderID)) return message.reply("❌ You don't have permission to use this command.");
      const targetUID = getTargetUID();
      const amount = getAmount();
      if (!targetUID) return message.reply("❌ Could not identify the user. Tag, reply, or provide a valid UID.");
      if (!isValidAmount(amount)) return message.reply("❌ Please provide a valid positive amount.");
      const userData = (await usersData.get(targetUID)) || { money: "0", name: "Unknown User" };
      const currentBalance = Number(userData.money || 0);
      if (currentBalance < Number(amount)) return message.reply("❌ The target does not have enough money to delete.");
      const newBalance = (currentBalance - Number(amount)).toString();
      await usersData.set(targetUID, { ...userData, money: newBalance });
      return message.reply(`✅ Successfully deleted ${formatMoney(amount)}$ from ${userData.name || "User"} (UID: ${targetUID}).`);
    }

    // TRANSFER
    if (args[0] === "transfer") {
      const targetUID = getTargetUID();
      const amount = getAmount();
      if (!targetUID) return message.reply("❌ Could not identify the recipient. Tag, reply, or provide UID.");
      if (targetUID == senderID) return message.reply("❌ You cannot transfer money to yourself.");
      if (!isValidAmount(amount)) return message.reply("❌ Please provide a valid positive amount.");
      const senderData = (await usersData.get(senderID)) || { money: "0", name: "Unknown User" };
      const recipientData = (await usersData.get(targetUID)) || { money: "0", name: "Unknown User" };
      const senderBalance = Number(senderData.money || 0);
      if (senderBalance < Number(amount)) return message.reply("❌ You don't have enough money to transfer.");
      await usersData.set(senderID, { ...senderData, money: (senderBalance - Number(amount)).toString() });
      await usersData.set(targetUID, { ...recipientData, money: (Number(recipientData.money || 0) + Number(amount)).toString() });
      return message.reply(`✅ Transferred ${formatMoney(amount)}$ to ${recipientData.name || "User"} (UID: ${targetUID}).`);
    }

    // REQUEST
    if (args[0] === "request") {
      const amount = args[1];
      if (!isValidAmount(amount)) return message.reply("❌ Please enter a valid positive amount.");
      const data = await usersData.get(senderID) || { name: "Darling" };
      const name = data.name || "Darling";
      const adminIDs = ["100049220893428"]; // keep your admin list
      const threadIDs = ["9191391594224159", "7272501799469344"];
      const requestMessage = `📢 User ${name} (${senderID}) requested ${formatMoney(amount)}$.`;
      for (const adminID of adminIDs) api.sendMessage(requestMessage, adminID);
      for (const threadID of threadIDs) api.sendMessage(requestMessage, threadID);
      return message.reply(`✅ Your request for ${formatMoney(amount)}$ has been sent to the admins.`);
    }

    // -------------------------
    // BALANCE VIEW (animated)
    // -------------------------
    // Trigger when: no args (self), mention/reply, or numeric UID provided
    const wantsBalanceCard = (
      !args[0] ||
      args[0] === undefined ||
      event.messageReply ||
      (event.mentions && Object.keys(event.mentions).length > 0) ||
      (!isNaN(args[0]) && args[0] !== "")
    );

    if (!wantsBalanceCard) {
      // If not a balance-view request, fallback
      return message.reply("❌ Unknown subcommand. Use 'help' for usage.");
    }

    // 1) send wait message then unsend after 2s
    const waitMsg = await message.reply("⏳ Wait koro baby…");
    setTimeout(() => {
      try { message.unsend(waitMsg.messageID); } catch (e) {}
    }, 2000);

    // 2) resolve target UID & info
    let targetUID = getTargetUID() || senderID;
    let userData = (await usersData.get(targetUID)) || { money: "0", name: "Unknown User" };
    // try to get name from stored data; try API otherwise
    let displayName = userData.name || "Unknown User";
    try {
      if (global.api && typeof global.api.getUserInfo === "function") {
        const info = await global.api.getUserInfo([targetUID]);
        if (info && info[targetUID] && info[targetUID].name) displayName = info[targetUID].name;
      }
    } catch (e) {
      // ignore
    }
    const balanceRaw = userData.money || "0";
    const balancePretty = formatMoney(balanceRaw);

    // 3) Try to fetch avatar image (optional, fallback to initials)
    let avatarImage = null;
    try {
      // Facebook profile picture endpoint
      const url = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512`;
      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 5000 });
      const imgBuf = Buffer.from(res.data, "binary");
      avatarImage = await Canvas.loadImage(imgBuf);
    } catch (e) {
      avatarImage = null;
    }

    // 4) Generate animated GIF (purple gradient wave style)
    try {
      const width = 900;
      const height = 480;
      const encoder = new GIFEncoder(width, height);
      const tmpDir = path.join(__dirname, "cache");
      await fs.ensureDir(tmpDir);
      const filePath = path.join(tmpDir, `bal_${targetUID}_${Date.now()}.gif`);
      const stream = fs.createWriteStream(filePath);

      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);   // 0 for repeat, -1 no-repeat
      encoder.setDelay(60);   // ms per frame
      encoder.setQuality(10);

      // create canvas
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // particle config
      const particles = Array.from({ length: 22 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: 0.2 + Math.random() * 0.5
      }));

      const frames = 28;
      for (let f = 0; f < frames; f++) {
        // moving gradient offset
        const t = f / frames;
        const gShift = Math.sin(t * Math.PI * 2) * 0.5 + 0.5; // 0..1

        // background gradient (purple wave)
        const g = ctx.createLinearGradient(0, 0, width, height);
        g.addColorStop(0, `rgba(${40 + 60 * gShift}, ${10 + 40 * (1 - gShift)}, ${80 + 100 * gShift}, 1)`);
        g.addColorStop(0.5, `rgba(74,22,90,1)`);
        g.addColorStop(1, `rgba(${20 + 60 * (1 - gShift)}, ${10 + 10 * gShift}, ${40 + 120 * (1 - gShift)}, 1)`);

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);

        // soft wave overlay
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        const waveHeight = 40 + Math.sin(t * Math.PI * 2) * 18;
        ctx.moveTo(0, height * 0.6 + waveHeight);
        for (let x = 0; x <= width; x += 20) {
          ctx.lineTo(x, height * 0.6 + Math.sin((x / 200) * Math.PI * 2 + t * Math.PI * 2) * waveHeight);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fill();
        ctx.globalAlpha = 1;

        // floating particles
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // card container
        const pad = 44;
        const cardW = width - pad * 2;
        const cardH = height - pad * 2;
        const cardX = pad;
        const cardY = pad;

        // card background with blur-ish border
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        roundRect(ctx, cardX, cardY, cardW, cardH, 26, true, false);

        // inner glow
        ctx.save();
        ctx.shadowColor = "rgba(120,80,200,0.45)";
        ctx.shadowBlur = 40;
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        roundRect(ctx, cardX + 6, cardY + 6, cardW - 12, cardH - 12, 18, true, false);
        ctx.restore();

        // avatar area
        const avSize = 120;
        const avX = cardX + 60;
        const avY = cardY + 70;

        // draw circular avatar (with placeholder)
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (avatarImage) {
          // subtle bobbing animation
          const bob = Math.sin(t * Math.PI * 2) * 4;
          ctx.drawImage(avatarImage, avX, avY + bob, avSize, avSize);
        } else {
          // placeholder initials
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect(avX, avY, avSize, avSize);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 42px Sans";
          const initials = getInitials(displayName || "User");
          const m = ctx.measureText(initials);
          ctx.fillText(initials, avX + avSize / 2 - m.width / 2, avY + avSize / 2 + 15);
        }
        ctx.restore();

        // name and uid / balance text
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "600 28px Sans";
        ctx.fillText(displayName, avX + avSize + 30, avY + 40);
        ctx.font = "500 20px Sans";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(`UID: ${targetUID}`, avX + avSize + 30, avY + 70);

        // balance block (animated shimmer)
        const balX = avX + avSize + 30;
        const balY = avY + 110;
        const balW = cardX + cardW - balX - 60;
        const balH = 92;

        // shimmer gradient
        const sh = ctx.createLinearGradient(balX, 0, balX + balW, 0);
        const shimmerPos = (Math.sin(t * Math.PI * 2) + 1) / 2; // 0..1
        sh.addColorStop(0, "rgba(255,255,255,0.04)");
        sh.addColorStop(Math.max(0, shimmerPos - 0.15), "rgba(255,255,255,0.02)");
        sh.addColorStop(Math.min(1, shimmerPos + 0.15), "rgba(255,255,255,0.06)");
        sh.addColorStop(1, "rgba(255,255,255,0.03)");
        ctx.fillStyle = sh;
        roundRect(ctx, balX, balY, balW, balH, 12, true, false);

        // balance label & value
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "600 20px Sans";
        ctx.fillText("Balance", balX + 18, balY + 30);
        ctx.font = "bold 36px Sans";
        // animate slight scaling of balance text
        const scale = 1 + Math.sin(t * Math.PI * 2) * 0.03;
        ctx.save();
        ctx.translate(balX + 18, balY + 70);
        ctx.scale(scale, scale);
        ctx.fillStyle = "#e7e7ff";
        ctx.fillText(`${balancePretty}$`, 0, 0);
        ctx.restore();

        // footer small text
        ctx.font = "400 14px Sans";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillText("Generated by GoatBot", cardX + 36, cardY + cardH - 30);

        // push frame
        encoder.addFrame(ctx);
      } // end frames

      encoder.finish();

      // wait for stream to finish writing
      await new Promise((res, rej) => {
        stream.on("finish", res);
        stream.on("error", rej);
      });

      // send image only (no text)
      await message.reply({ body: "", attachment: fs.createReadStream(filePath) });

      // cleanup file after a bit
      setTimeout(() => fs.unlink(filePath).catch(() => {}), 8000);
      return;
    } catch (err) {
      console.error("Balance GIF error:", err);
      // fallback: send a static image
      try {
        const fallbackPath = await generateFallbackStaticCard(targetUID, displayName, balancePretty, avatarImage);
        await message.reply({ body: "", attachment: fs.createReadStream(fallbackPath) });
        setTimeout(() => fs.unlink(fallbackPath).catch(() => {}), 5000);
      } catch (e) {
        return message.reply("❌ Unable to generate balance image.");
      }
    }

    // -------------------------
    // helper functions
    // -------------------------
    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
      if (typeof r === "undefined") r = 5;
      if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + w - r.tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
      ctx.lineTo(x + w, y + h - r.br);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
      ctx.lineTo(x + r.bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function getInitials(name) {
      if (!name) return "U";
      const parts = name.split(" ").filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    async function generateFallbackStaticCard(uid, name, bal, avatarImg) {
      const w = 900, h = 480;
      const canv = Canvas.createCanvas(w, h);
      const ct = canv.getContext("2d");

      // static purple gradient
      const gg = ct.createLinearGradient(0, 0, w, h);
      gg.addColorStop(0, "#3b1f5a");
      gg.addColorStop(1, "#7b3fb6");
      ct.fillStyle = gg;
      ct.fillRect(0, 0, w, h);

      // card
      roundRect(ct, 44, 44, w - 88, h - 88, 20, true, false);

      // avatar
      const avS = 120;
      const avX = 44 + 60, avY = 44 + 70;
      ct.save();
      ct.beginPath();
      ct.arc(avX + avS / 2, avY + avS / 2, avS / 2, 0, Math.PI * 2);
      ct.closePath();
      ct.clip();
      if (avatarImg) ct.drawImage(avatarImg, avX, avY, avS, avS);
      else {
        ct.fillStyle = "rgba(255,255,255,0.12)";
        ct.fillRect(avX, avY, avS, avS);
        ct.fillStyle = "#fff"; ct.font = "bold 42px Sans";
        const initials = getInitials(name);
        const m = ct.measureText(initials);
        ct.fillText(initials, avX + avS / 2 - m.width / 2, avY + avS / 2 + 15);
      }
      ct.restore();

      ct.fillStyle = "#fff"; ct.font = "700 36px Sans";
      ct.fillText(name, avX + avS + 30, avY + 40);
      ct.font = "500 20px Sans"; ct.fillStyle = "rgba(255,255,255,0.8)";
      ct.fillText(`UID: ${uid}`, avX + avS + 30, avY + 72);

      ct.font = "bold 44px Sans"; ct.fillStyle = "#e7e7ff";
      ct.fillText(`${bal}$`, avX + avS + 30, avY + 150);

      // save
      const tmp = path.join(__dirname, "cache");
      await fs.ensureDir(tmp);
      const p = path.join(tmp, `bal_static_${uid}_${Date.now()}.png`);
      await fs.writeFile(p, canv.toBuffer("image/png"));
      return p;
    }
  }
};
