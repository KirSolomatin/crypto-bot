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

    bot.setMyCommands([
        { command: '/start', description: 'Start the bot' },
        { command: '/menu', description: 'Bot menu' },
    ]);

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

    bot.onText(/\/menu/, (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId, 'Select a section:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Crypto', callback_data: 'get_crypto' },
                        { text: 'Metal', callback_data: 'get_metal' }
                    ]
                ]
            }
        });
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;

        if (query.data === 'get_crypto'){
            bot.sendMessage(chatId, 'Select a coin', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'BTC', callback_data: 'get_btc'},
                            {text: 'ETH', callback_data: 'get_eth'},
                            {text: 'GRAM', callback_data: 'get_gram'}
                        ]
                    ]
                }
            });
        }
    });

    setInterval(async () => {
        if (!chatId) return;
        const currentBitcoinPrice = await getBitcoinPrice();
        const diff = ((currentBitcoinPrice - lastBitcoinPrice) / lastBitcoinPrice) * 100;

        if (Math.abs(diff) > 0.5) {
            bot.sendMessage(chatId, `Bitcoin changed ${diff.toFixed(2)}%, current price: ${currentBitcoinPrice}$`)
            lastBitcoinPrice = currentBitcoinPrice;
        }
    }, 30000);

    setInterval(async () => {
        if (!chatId) return;
        const currentEthereumPrice = await getEthereumPrice();
        const diff = ((currentEthereumPrice - lastEthereumPrice) / lastEthereumPrice) * 100;

        if (Math.abs(diff) > 0.5) {
            bot.sendMessage(chatId, `Ethereum changed ${diff.toFixed(2)}%, current price: ${currentEthereumPrice}$`)
            lastEthereumPrice = currentEthereumPrice;
        }
    }, 30000);

    setInterval(async () => {
        if (!chatId) return;
        const currentGramPrice = await getGramPrice();
        const diff = ((currentGramPrice - lastGramPrice) / lastGramPrice) * 100;

        if (Math.abs(diff) > 0.5) {
            bot.sendMessage(chatId, `Gram changed ${diff.toFixed(2)}%, current price: ${currentGramPrice}$`)
            lastGramPrice = currentGramPrice;
        }
    }, 30000);
}

module.exports = startBot;