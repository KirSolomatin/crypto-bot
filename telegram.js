require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

function startBot() {
    bot.on("message", (msg) => {
        bot.sendMessage(msg.chat.id, "Hello, World!")
    });
}

module.exports = startBot;