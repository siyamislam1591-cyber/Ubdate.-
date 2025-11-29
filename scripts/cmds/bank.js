const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "2.1",
    author: "Siyuu + Siyam (Fixed)",
    role: 0,
    shortDescription: "Bank system",
    category: "economy"
  },

  onStart: async function ({ message, args, event, usersData, api }) {

    const uid = event.senderID;

    // ----- LOAD USER DATA -----
    let user = await usersData.get(uid);
    if (!user.data) user.data = {};

    let wallet = Number(user.money || 0);
    let bank = Number(user.data.bank || 0); // store here (SAFE)

    const action = args[0] ? args[0].toLowerCase() : "";
    const amount = args[1] ? parseInt(args[1]) : 0;

    // ---------- CANVAS CARD FUNCTION ----------
    async function card(title, text, avatar, name) {
      const w = 900, h = 500;
      const canvas = Canvas.createCanvas(w, h);
      const ctx = canvas.getContext("2d");

      const grad = ctx.createLinearGradient(0,0,w,h);
      grad.addColorStop(0,"#6a11cb");
      grad.addColorStop(1,"#2575fc");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.roundRect(50,50,w-100,h-100,20);
      ctx.fill();

      if(avatar){
        const img = await Canvas.loadImage(avatar);
        ctx.save();
        ctx.beginPath();
        ctx.arc(120,120,80,0,Math.PI*2);
        ctx.clip();
        ctx.drawImage(img,40,40,160,160);
        ctx.restore();
      }

      ctx.fillStyle="#fff";
      ctx.font="bold 50px Sans-serif";
      ctx.fillText(title,250,120);

      ctx.font="bold 40px Sans-serif";
      ctx.fillText("Name: "+name,250,200);

      text.split("\n").forEach((l,i)=>{
        ctx.fillText(l,250,260+i*55);
      });

      ctx.font="20px Sans-serif";
      ctx.fillText("siyuu",w-100,h-25);

      const file = path.join(__dirname,"cache",`bank_${Date.now()}.png`);
      await fs.ensureDir(path.join(__dirname,"cache"));
      fs.writeFileSync(file,canvas.toBuffer());
      return file;
    }

    // ---- GET FB NAME + PROFILE ----
    let fb = await api.getUserInfo(uid);
    let name = fb[uid]?.name || "User";
    let avatar = fb[uid]?.thumbSrc || "";

    // ---------- NO ARG = MENU ----------
    if (!action) {
      return message.reply(
`🏦 Bank Menu

/bank balance  
/bank deposit <amount>  
/bank withdraw <amount>  
/bank atm`
      );
    }

    // ---------- BALANCE ----------
    if (action === "balance") {
      const img = await card(
        "Bank Balance",
        `Bank: $${bank}\nWallet: $${wallet}`,
        avatar, name
      );
      return message.reply({ attachment: fs.createReadStream(img) });
    }

    // ---------- DEPOSIT ----------
    if (action === "deposit") {
      if (!amount || amount <= 0)
        return message.reply("Enter valid deposit amount.");

      if (wallet < amount)
        return message.reply("❌ Deposit failed. Not enough wallet balance.");

      wallet -= amount;
      bank += amount;

      // SAVE SAFELY
      user.money = wallet;
      user.data.bank = bank;
      await usersData.set(uid, user);

      const img = await card(
        "Deposit Successful",
        `Deposited: $${amount}\nBank: $${bank}\nWallet: $${wallet}`,
        avatar, name
      );

      return message.reply({ attachment: fs.createReadStream(img) });
    }

    // ---------- WITHDRAW ----------
    if (action === "withdraw") {
      if (!amount || amount <= 0)
        return message.reply("Enter valid withdraw amount.");

      if (bank < amount)
        return message.reply("❌ Withdrawal failed. Please check your bank balance.");

      bank -= amount;
      wallet += amount;

      // SAVE SAFELY
      user.money = wallet;
      user.data.bank = bank;
      await usersData.set(uid, user);

      const img = await card(
        "Withdraw Successful",
        `Withdrawn: $${amount}\nBank: $${bank}\nWallet: $${wallet}`,
        avatar, name
      );

      return message.reply({ attachment: fs.createReadStream(img) });
    }

    // ---------- ATM ----------
    if (action === "atm") {
      const img = await card(
        "ATM CARD",
        `Bank: $${bank}\nWallet: $${wallet}`,
        avatar, name
      );
      return message.reply({ attachment: fs.createReadStream(img) });
    }

    return message.reply("Unknown argument.");
  }
};
