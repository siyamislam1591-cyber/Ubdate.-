const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "top",
    version: "3.1",
    author: "siyuu",
    role: 0,
    shortDescription: { en: "Show Top Richest Users as Image Card" },
    category: "group",
    guide: { en: "{pn}top 10" }
  },

  onStart: async function({ api, args, message, usersData }) {
    const limit = args[0] ? parseInt(args[0]) : 10;
    if (isNaN(limit) || limit <= 0) return message.reply("❗ Please enter a valid number.");

    const allUsers = await usersData.getAll();
    const sortedUsers = allUsers.sort((a,b)=>(b.money||0)-(a.money||0)).slice(0,limit);

    const tmpDir = path.join(__dirname,"cache");
    await fs.ensureDir(tmpDir);
    const filePath = path.join(tmpDir, `top_${Date.now()}.png`);

    const width = 900;
    const height = 120 + sortedUsers.length * 90; // auto height
    const canvas = Canvas.createCanvas(width,height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#f5f5f5"; 
    ctx.fillRect(0,0,width,height);

    // Header
    ctx.font = "bold 50px Sans-serif";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(`🏆 TOP ${limit} RICHEST USERS`, width/2, 60);

    // Divider
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 80);
    ctx.lineTo(width-50, 80);
    ctx.stroke();

    // Icons
    const icons = {1:"👑",2:"🥈",3:"🥉"};
    const normalIcons = ["🔶","🔷"];

    // User List
    sortedUsers.forEach((user,index)=>{
      const y = 140 + index*80;
      const rank = index+1;
      const icon = icons[rank] || normalIcons[index%2];
      const moneyText = formatNumber(user.money||0);

      // Name (larger)
      ctx.font = "bold 38px Sans-serif";
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";
      ctx.fillText(`${icon} Rank ${rank}: ${user.name}`, 50, y);

      // Balance (smaller)
      ctx.font = "28px Sans-serif";
      ctx.fillStyle = "#555";
      ctx.fillText(`💰 Balance: ${moneyText}`, 50, y+40);
    });

    // Save image
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(filePath, buffer);

    await message.reply({ body:`🏆 TOP ${limit} RICHEST USERS`, attachment: fs.createReadStream(filePath) });
    setTimeout(()=>fs.unlink(filePath).catch(()=>{}),8000);

    function formatNumber(num){
      if(num>=1e15) return (num/1e15).toFixed(2)+"Q";
      if(num>=1e12) return (num/1e12).toFixed(2)+"T";
      if(num>=1e9) return (num/1e9).toFixed(2)+"B";
      if(num>=1e6) return (num/1e6).toFixed(2)+"M";
      if(num>=1e3) return (num/1e3).toFixed(2)+"K";
      return num.toFixed(2);
    }
  }
};
