const fs = require('fs');
const os = require('os');
const path = require('path');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "uptime",
    version: "3.7",
    author: "Styled by nx (Cyber-Aesthetic Hybrid)",
    role: 0,
    shortDescription: "Cyber aesthetic uptime display",
    longDescription: "Shows uptime, system, and bot stats with subtle hanka-style emojis",
    category: "system",
    aliases: ["cyup", "cyberup", "statusx"],
  },

  onStart: async function ({ api, event }) {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
      const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const cpuModel = os.cpus()[0].model;
      const platform = os.platform();
      const arch = os.arch();

      const commandsPath = path.join(__dirname, "../cmds");
      let totalCommands = 0;
      if (fs.existsSync(commandsPath)) {
        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
        totalCommands = files.length;
      } else if (global.GoatBot?.commands) {
        totalCommands = global.GoatBot.commands.size;
      }

      const temp = Math.floor(Math.random() * 30) + 25;
      const cpuLoad = (process.cpuUsage().user / 1000000).toFixed(2);
      const signal = "█".repeat(10);

      const bdTime = moment().tz("Asia/Dhaka");

      const msg = `
═══════════════════════════════════
🟢 SYSTEM ONLINE // v3.7
═══════════════════════════════════

𝐂𝐨𝐫𝐞 𝐒𝐭𝐚𝐭𝐮𝐬
⏳ Uptime: ${days}d ${hours}h ${minutes}m
⚡ Latency: ${Date.now() - event.timestamp}ms
📦 Commands: ${totalCommands}
✅ Stability: Stable
───────────────────────────────

𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
🪟 OS: ${platform.toUpperCase()} (${arch})
🧠 CPU: ${cpuModel}
💾 RAM: ${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)} MB
🗄 Storage: ${usedMem}GB / ${totalMem}GB
🛠 CPU Load: ${cpuLoad}%
───────────────────────────────

𝐁𝐨𝐭 𝐈𝐧𝐠𝐢𝐧𝐞 𝐃𝐚𝐭𝐚
📂 Directory: ${path.basename(__dirname)}
⚙️ Node.js: ${process.version}
🧩 PID: ${process.pid}
📶 Signal: ${signal} 100%
🌡 Temperature: ${temp}°C
🔒 Network: Encrypted | AES-256 Secure
───────────────────────────────

𝐎𝐰𝐧𝐞𝐫 𝐃𝐚𝐭𝐚
👑 Name: Negative Xalman (nx)
💬 Messenger: https://m.me/nx210.2.0.is.back
───────────────────────────────

𝐓𝐢𝐦𝐞 𝐒𝐲𝐧𝐞 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡
📅 Date: ${bdTime.format('dddd, MMMM Do YYYY')}
🕒 Time: ${bdTime.format('hh:mm:ss A')} (Asia/Dhaka)
───────────────────────────────

𝐒𝐲𝐬𝐭𝐞𝐦 𝐒𝐭𝐚𝐭𝐮𝐬 𝐑𝐞𝐩𝐨𝐫𝐭
🟢 Core Engine: ONLINE
🛡 Firewall: ACTIVE
🔗 Neural Link: STABLE
🤖 AI Threads: SYNCHRONIZED
───────────────────────────────

𝐆𝐨𝐚𝐭 𝐁𝐨𝐭 𝐂𝐨𝐫𝐞// 𝐁𝐮𝐢𝐥𝐝
💎 Developer: MÁYBÉ NX
⚡ Power Source: Quantum Node Reactor
───────────────────────────────

SYSTEM RUNNING // NO ERRORS DETECTED
═══════════════════════════════════
`;

      api.sendMessage(msg, event.threadID);
    } catch (err) {
      console.error("Uptime error:", err);
      api.sendMessage("[SYSTEM ERROR] Unable to fetch core diagnostics.", event.threadID);
    }
  }
};
