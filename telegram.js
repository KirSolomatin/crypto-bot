require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const { getBitcoinPrice, getEthereumPrice, getGramPrice } = require('./price');

async function startBot() {
    let chatId = null;


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

        bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$ \n Current Ethereum price: ${ethereumPrice}$ \n Current Gram price: ${gramPrice}$`)
    }, 3600000);
}

module.exports = startBot;