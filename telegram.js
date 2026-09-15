require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const { getBitcoinPrice, getEthereumPrice, getGramPrice } = require('./price');

async function startBot() {
    let chatId = null;
    let lastBitcoinPrice = null;
    let lastEthereumPrice = null;
    let lastGramPrice = null;

    bot.onText(/\/start/, async (msg) => {
        chatId = msg.chat.id;
        
        lastBitcoinPrice = await getBitcoinPrice();
        lastEthereumPrice = await getEthereumPrice();
        lastGramPrice = await getGramPrice();

        try {
            bot.sendMessage(chatId, `Current Bitcoin price: ${lastBitcoinPrice}$ \nCurrent Ethereum price: ${lastEthereumPrice}$ \nCurrent Gram price: ${lastGramPrice}$`)
        }

        catch {
            bot.sendMessage(chatId, `Can't get a current price`);
        }
    });

    setInterval(async () => {
        if (!chatId) return;
        const currentBitcoinPrice = await getBitcoinPrice();
        const diff = ((currentBitcoinPrice - lastBitcoinPrice) / lastBitcoinPrice) * 100;

        if (Math.abs(diff) > 0.5){
            bot.sendMessage(chatId, `Bitcoin changed ${diff.toFixed(2)}%, current price: ${currentBitcoinPrice}$`)
            lastBitcoinPrice = currentBitcoinPrice;
        } 
    }, 30000);

    setInterval(async () => {
        if (!chatId) return;
        const currentEthereumPrice = await getEthereumPrice();
        const diff = ((currentEthereumPrice - lastEthereumPrice) / lastEthereumPrice) * 100;

        if (Math.abs(diff) > 0.5){
            bot.sendMessage(chatId, `Ethereum changed ${diff.toFixed(2)}%, current price: ${currentEthereumPrice}$`)
            lastEthereumPrice = currentEthereumPrice;
        } 
    }, 30000);

    setInterval(async () => {
        if (!chatId) return;
        const currentGramPrice = await getGramPrice();
        const diff = ((currentGramPrice - lastGramPrice) / lastGramPrice) * 100;

        if (Math.abs(diff) > 0.5){
            bot.sendMessage(chatId, `Gram changed ${diff.toFixed(2)}%, current price: ${currentGramPrice}$`)
            lastGramPrice = currentGramPrice;
        } 
    }, 30000);
}

module.exports = startBot;