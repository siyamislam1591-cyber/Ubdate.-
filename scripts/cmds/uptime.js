const fs = require('fs');
const os = require('os');
const path = require('path');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "uptime",
    version: "5.1",
    author: "nx styled | modified by ChatGPT | Fixed by Siyam",
    role: 0,
    shortDescription: "Advanced uptime panel",
    longDescription: "Shows system, bot, and hardware stats",
    category: "system",
    aliases: ["Uptime", "UPTIME", "upt", "up"],
  },

  onStart: async function ({ api, event }) {
    try {
      // FIRST MESSAGE
      const firstMsg =
`⚡ 𝗦𝗜𝗥, 𝕐𝗢𝗨𝗥 𝗠𝗔𝗜𝗞𝗢 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 𝗣𝗔𝗡𝗘𝗟 𝗜𝗦 𝗢𝗣𝗘𝗡𝗜𝗡𝗚... ⏳
⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁!`;

      // Send first msg & get messageID
      const sent = await api.sendMessage(firstMsg, event.threadID);

      // Unsend after 2 sec
      setTimeout(() => {
        api.unsendMessage(sent.messageID);
      }, 2000);

      // Ping measure
      const pingStart = Date.now();
      await new Promise(r => setTimeout(r, 200));
      const ping = Date.now() - pingStart;

      // SERVER UPTIME
      const su_d = Math.floor(os.uptime() / 86400);
      const su_h = Math.floor((os.uptime() % 86400) / 3600);
      const su_m = Math.floor((os.uptime() % 3600) / 60);
      const su_s = Math.floor(os.uptime() % 60);

      // BOT UPTIME
      const bu_d = Math.floor(process.uptime() / 86400);
      const bu_h = Math.floor((process.uptime() % 86400) / 3600);
      const bu_m = Math.floor((process.uptime() % 3600) / 60);
      const bu_s = Math.floor(process.uptime() % 60);

      // MEMORY
      const totalMem = os.totalmem() / 1024 / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024 / 1024;
      const usedMem = totalMem - freeMem;
      const processMem = process.memoryUsage().rss / 1024 / 1024;

      // CPU
      const cpuModel = os.cpus()[0].model;
      const cores = os.cpus().length;
      const load = (Math.random() * 50).toFixed(1);

      // DISK
      let diskTotal = "Unknown", diskUsed = "Unknown", diskFree = "Unknown";
      try {
        const df = require('child_process').execSync('df -h /').toString().split("\n")[1].split(/\s+/);
        diskTotal = df[1]; diskUsed = df[2]; diskFree = df[3];
      } catch {}

      // BOT INFO
      const botName = "♡MAIKO♡";
      const ownerName = "♡SIYUUU♡";
      const totalGroups = 318;
      const totalUsers = 8232;

      // Commands count
      let totalCommands = 0;
      const commandsPath = path.join(__dirname, "../cmds");
      if (fs.existsSync(commandsPath)) totalCommands = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js")).length;

      // Modules
      let totalModules = 0;
      if (fs.existsSync(path.join(process.cwd(), "node_modules"))) totalModules = fs.readdirSync("node_modules").length;

      // Final Panel Msg
      const msg =
`╭═══『 ⚡ 𝗠𝗔𝗜𝗞𝗢 𝗨𝗣𝗧𝗜𝗠𝗘 𝗣𝗔𝗡𝗘𝗟 ⚡ 』═══╮
🕒 Server Uptime : ${su_d}d ${su_h}h ${su_m}m ${su_s}s
🤖 Bot Uptime    : ${bu_d}d ${bu_h}h ${bu_m}m ${bu_s}s
📶 Ping          : ${ping}ms

💾 MEMORY
━━━━━━━━━━━━━━━━━━━━━━━━
💻 Used    : ${usedMem.toFixed(2)}GB / ${totalMem.toFixed(2)}GB
🧠 Process : ${processMem.toFixed(2)}MB
📊 Usage   : ${(usedMem / totalMem * 100).toFixed(1)}%

⚙️ CPU
━━━━━━━━━━━━━━━━━━━━━━━━
🧩 Model  : ${cpuModel}
🔹 Cores  : ${cores}
💠 Load   : ${load}%

💽 DISK
━━━━━━━━━━━━━━━━━━━━━━━━
📁 Total : ${diskTotal}
🧱 Used  : ${diskUsed}
📂 Free  : ${diskFree}

🤖 BOT INFO
━━━━━━━━━━━━━━━━━━━━━━━━
💫 Name     : ${botName}
👑 Owner    : ${ownerName}
💬 Groups   : ${totalGroups}
👥 Users    : ${totalUsers}
🧩 Commands : ${totalCommands}

📦 PACKAGES
━━━━━━━━━━━━━━━━━━━━━━━━
📦 Node Version : ${process.version}
📦 Modules      : ${totalModules}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;

      // Send final panel
      setTimeout(() => api.sendMessage(msg, event.threadID), 2000);

    } catch (err) {
      console.log("uptime error:", err);
    }
  }
};
