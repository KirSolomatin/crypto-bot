require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function getBitcoinPrice () {
    const bitcoin = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"); 
    return Number(bitcoin.data.price).toFixed(3);
}

async function getEthereumPrice () {
    const ethereum = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
    return Number(ethereum.data.price).toFixed(3);
}

async function getGramPrice () {
    const gram = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=GRAMUSDT");
    return Number(gram.data.price).toFixed(3); 
}
async function startBot() {
    let chatId  = null;

    
    bot.onText(/\/start/, async (msg) => {
        chatId = msg.chat.id;
        const bitcoinPrice = await getBitcoinPrice();
        const ethereumPrice = await getEthereumPrice();
        const gramPrice = await getGramPrice();

        bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$ \nCurrent Ethereum price: ${ethereumPrice}$ \nCurrent Gram price: ${gramPrice}$`)
    });

    setInterval(async () => {
        if (!chatId) return;
        const bitcoinPrice = await getBitcoinPrice();
        const ethereumPrice = await getEthereumPrice();
        const gramPrice = await getGramPrice();

        bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$ \n Current Ethereum price: ${ethereumPrice}$ \n Current Gram price: ${gramPrice}$`)}, 3600000);
}

module.exports = startBot;