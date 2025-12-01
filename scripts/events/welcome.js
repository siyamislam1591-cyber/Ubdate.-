// ===================[ WELCOME MODULE WITH AUTO IMAGE ]==================== //

const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

// OPTIONAL magical font (if you have it)
// registerFont(__dirname + "/fonts/magical.ttf", { family: "Magical" });

module.exports = {
    config: {
        name: "welcome",
        version: "2.0",
        author: "ChatGPT Modified",
        category: "events"
    },

    // ===================[ IMAGE GENERATOR FUNCTION ]==================== //

    generateWelcomeCard: async function (name, uid) {
        const width = 1400;
        const height = 600;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Background (Beautiful Horror + Cute Vibes)
        const bg = await loadImage("https://files.catbox.moe/7hjbie.jpg");
        ctx.drawImage(bg, 0, 0, width, height);

        // Cute magical glow layer
        const glow = ctx.createRadialGradient(700, 300, 80, 700, 300, 700);
        glow.addColorStop(0, "rgba(255, 160, 220, 0.45)");
        glow.addColorStop(1, "rgba(0, 0, 0, 0.6)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        // User PFP
        const pfp = `https://graph.facebook.com/${uid}/picture?width=720&height=720`;
        const avatar = await loadImage(pfp);

        // Circle mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 300, 180, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 120, 120, 360, 360);
        ctx.restore();

        // "maiko" big magical title
        ctx.font = "bold 110px Sans-Serif";
        ctx.fillStyle = "#ff66cc";
        ctx.shadowColor = "#ff00ff";
        ctx.shadowBlur = 25;
        ctx.fillText("maiko", 550, 200);

        // Welcome name
        ctx.shadowBlur = 0;
        ctx.font = "bold 50px Sans-Serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Welcome, ${name}!`, 550, 310);

        ctx.font = "40px Sans-Serif";
        ctx.fillStyle = "#ffcccc";
        ctx.fillText(`We're happy to have you here 🌸`, 550, 380);

        return canvas.toBuffer();
    },

    // ===================[ MAIN EVENT LISTENER ]==================== //

    onStart: async function ({ threadsData, message, event, api }) {

        if (event.logMessageType !== "log:subscribe") return;

        return async () => {
            const threadID = event.threadID;
            const added = event.logMessageData.addedParticipants;

            // If bot joined
            if (added.some(u => u.userFbId == api.getCurrentUserID())) {
                return message.send("✨ Bot Connected Successfully!\nUse /help");
            }

            // Handle members join
            for (const user of added) {
                const name = user.fullName;
                const uid = user.userFbId;

                // Generate image
                const img = await module.exports.generateWelcomeCard(name, uid);

                // Time
                const time = getTime("HH:mm:ss");
                const date = getTime("DD/MM/YYYY");

                message.send({
                    body:
`👋 Hello ${name}
🌸 Welcome to the group!
⏳ Join Time: ${time}
📅 Date: ${date}`,
                    attachment: img
                });
            }
        };
    }
};
