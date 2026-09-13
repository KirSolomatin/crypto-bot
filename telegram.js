require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function getBitcoinPrice () {
    const bitcoin = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"); 
    return Number(bitcoin.data.price).toFixed(2);
}

async function startBot() {
    let chatId  = null;

    
    bot.onText(/\/start/, async (msg) => {
        chatId = msg.chat.id;
        const bitcoinPrice = await getBitcoinPrice();
        bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$`)
    });

    setInterval(async () => {
        if (!chatId) return;
        const bitcoinPrice = await getBitcoinPrice();
        bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$`)}, 3600000);
}

module.exports = startBot;