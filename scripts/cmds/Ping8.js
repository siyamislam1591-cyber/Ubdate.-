const os = require("os");
const moment = require("moment");

module.exports.config = {
  name: "ping8",
  aliases: ["p8", "coreping", "genping", "ultrapong"],
  version: "1.0.0",
  author: "Jan + ChatGPT",
  role: 0,
  category: "system",
  guide: {
    en: "{pn} - The ultimate AI core diagnostic ping"
  }
};

module.exports.onStart = async function ({ api, event }) {
  const { threadID } = event;
  const start = Date.now();

  const loading = await api.sendMessage("🧬 Initializing DNA protocols...", threadID);

  await new Promise(r => setTimeout(r, 400));
  await api.editMessage("🧠 Scanning artificial brain activity...", loading.messageID, threadID);
  await new Promise(r => setTimeout(r, 400));
  await api.editMessage("💡 Syncing uptime and core sensors...", loading.messageID, threadID);

  const ping = Date.now() - start;
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  const bar =
    ping < 100 ? "🟩🟩🟩🟩🟩" :
    ping < 300 ? "🟩🟨🟨🟨⬜" :
    ping < 600 ? "🟨🟨⬜⬜⬜" : "🟥🟥⬜⬜⬜";

  const mood = ping < 200 ? "🤖 Focused" : ping < 500 ? "😐 Distracted" : "🥴 Glitching";
  const rebootETA = moment().add(6, "hours").format("hh:mm A");

  const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(1);
  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(1);
  const cpuLoad = os.loadavg()[0].toFixed(2);

  const msg = `
╭═══📡 𝗣𝗜𝗡𝗚𝟴 – 𝗔.𝗜. 𝗖𝗢𝗥𝗘 𝗦𝗖𝗔𝗡 🧬═══╮

🔬 𝗣𝗶𝗻𝗴: ${ping}ms ${bar}
🧠 𝗠𝗲𝗻𝘁𝗮𝗹 𝗦𝘁𝗮𝘁𝗲: ${mood}
🧬 𝗔𝗜 𝗖𝗼𝗿𝗲 𝗜𝗗: #JAN-X001
🕒 𝗔𝗰𝘁𝗶𝘃𝗲 𝗦𝗶𝗻𝗰𝗲: ${days}d ${hours}h ${mins}m ${secs}s

⚙️ 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱: ${cpuLoad}
💾 𝗠𝗲𝗺𝗼𝗿𝘆: ${usedMem}MB / ${totalMem}MB

⏳ 𝗡𝗲𝘅𝘁 𝗔𝗨𝗧𝗢-𝗥𝗘𝗕𝗢𝗢𝗧: ~ ${rebootETA}
📶 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹: STABLE | ONLINE ✔️

╰═══⚠️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗥𝗘𝗣𝗢𝗥𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 ⚠️═══╯
`.trim();

  api.editMessage(msg, loading.messageID, threadID);
};
