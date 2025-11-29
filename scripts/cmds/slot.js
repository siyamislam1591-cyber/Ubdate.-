const Canvas = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    version: "2.0",
    author: "OtinXSandip + Cute Slot Card",
    shortDescription: { en: "Slot game with animated card" },
    longDescription: { en: "Slot game with animated image card showing win/loss and balance" },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to spin the slot",
      not_enough_money: "You don't have enough balance",
      spinning: "Spinning the slot..."
    },
  },

  onStart: async function({ args, message, event, usersData, getLang }) {
    const senderID = event.senderID;
    const userData = await usersData.get(senderID);
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply(getLang("invalid_amount"));
    if (bet > (userData.money || 0)) return message.reply(getLang("not_enough_money"));

    const slots = ["💚","💛","💙","💛","💚","💙","💙","💛","💚"];
    const slot1 = slots[Math.floor(Math.random()*slots.length)];
    const slot2 = slots[Math.floor(Math.random()*slots.length)];
    const slot3 = slots[Math.floor(Math.random()*slots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, bet);
    const newBalance = Math.max((userData.money || 0) + winnings,0);
    await usersData.set(senderID,{ money: newBalance, data: userData.data });

    const imgPath = await generateSlotCard({ slot1, slot2, slot3, winnings, balance: newBalance });
    await message.reply({ body:"🎰 Slot Result", attachment: fs.createReadStream(imgPath) });
    setTimeout(()=>fs.unlink(imgPath).catch(()=>{}),8000);
  }
};

function calculateWinnings(s1,s2,s3,bet){
  if(s1==="💚" && s2==="💚" && s3==="💚") return bet*10;
  if(s1==="💛" && s2==="💛" && s3==="💛") return bet*5;
  if(s1===s2 && s2===s3) return bet*3;
  if(s1===s2 || s1===s3 || s2===s3) return bet*2;
  return -bet;
}

async function generateSlotCard({ slot1, slot2, slot3, winnings, balance }) {
  const width=700, height=400;
  const encoder = new GIFEncoder(width,height);
  const tmpDir=path.join(__dirname,"cache");
  await fs.ensureDir(tmpDir);
  const filePath = path.join(tmpDir, `slot_${Date.now()}.gif`);
  const stream = fs.createWriteStream(filePath);
  encoder.createReadStream().pipe(stream);
  encoder.start(); encoder.setRepeat(0); encoder.setDelay(120); encoder.setQuality(10);

  const canvas = Canvas.createCanvas(width,height);
  const ctx = canvas.getContext("2d");
  const frames = 20;

  for(let f=0; f<frames; f++){
    // Background
    ctx.fillStyle="#ffe4e1";
    ctx.fillRect(0,0,width,height);

    // Slot symbols with slight shake animation
    ctx.font = "bold 100px Arial";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    const offset = f<frames-1 ? Math.random()*20-10 : 0;
    ctx.fillStyle="#000";
    ctx.fillText(slot1,width/4 + offset,height/2);
    ctx.fillText(slot2,width/2 + offset,height/2);
    ctx.fillText(slot3,width*3/4 + offset,height/2);

    // Result text
    ctx.font="bold 60px Arial";
    ctx.fillStyle = winnings>=0 ? "#228B22" : "#B22222";
    const resultText = winnings>=0 ? `You Won $${winnings}` : `You Lost $${-winnings}`;
    ctx.fillText(resultText,width/2,height/2+100);

    // Balance text
    ctx.font="bold 50px Arial";
    ctx.fillStyle="#000";
    const balanceText = balance>0 ? `Balance: $${balance}` : `Sorry, your current balance $${balance}`;
    ctx.fillText(balanceText,width/2,height/2+170);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  await new Promise((res,rej)=>{stream.on("finish",res); stream.on("error",rej);});
  return filePath;
                 }
