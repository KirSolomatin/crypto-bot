require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const { getBitcoinPrice, checkBitcoinPrice } = require('./crypto/bitcoin');
const { getEthereumPrice, checkEthereumPrice } = require('./crypto/ethereum');
const { getGramPrice, checkGramPrice } = require('./crypto/gram');
const { loadUsers, saveUser } = require('./users');

async function startBot() {
    bot.setMyCommands([
        { command: '/start', description: 'Start the bot' },
        { command: '/menu', description: 'Bot menu' },
    ]);

    bot.onText(/\/start/, async (msg) => {
        chatId = msg.chat.id;
        saveUser(chatId);

        let bitcoinPrice = await getBitcoinPrice();
        let ethereumPrice = await getEthereumPrice();
        let gramPrice = await getGramPrice();

        try {
            bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$ \nCurrent Ethereum price: ${ethereumPrice}$ \nCurrent Gram price: ${gramPrice}$`)
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

    setInterval(() => checkBitcoinPrice(bot), 3000);

    setInterval(() => checkEthereumPrice(bot), 30000);

    setInterval(() => checkGramPrice(bot), 30000);
}

module.exports = startBot;