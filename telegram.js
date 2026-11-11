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
        // chatId = msg.chat.id;
        // saveUser(chatId);

        // let bitcoinPrice = await getBitcoinPrice();
        // let ethereumPrice = await getEthereumPrice();
        // let gramPrice = await getGramPrice();

        // try {
        //     bot.sendMessage(chatId, `Current Bitcoin price: ${bitcoinPrice}$ \nCurrent Ethereum price: ${ethereumPrice}$ \nCurrent Gram price: ${gramPrice}$`)
        // }

        // catch {
        //     bot.sendMessage(chatId, `Can't get a current price`);
        // }
    });

    //Menu interface
    bot.onText(/\/menu/, (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId, 'Select a section:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Crypto', callback_data: 'get_crypto' }],
                    [{ text: 'Metal', callback_data: 'get_metal' }]
                ]
            }
        });
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;

        switch (query.data) {
            case 'get_crypto':
                bot.sendMessage(chatId, 'Select a coin:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'BTC', callback_data: 'get_btc' }],
                            [{ text: 'ETH', callback_data: 'get_eth' }],
                            [{ text: 'GRAM', callback_data: 'get_gram' }]
                        ]
                    }
                });
                break;
            //btc menu
            case 'get_btc':
                bot.sendMessage(chatId, 'Bitcoin, select an option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_btc_current_price' }]
                        ]
                    }
                })
                break;
            //eth menu
            case 'get_eth':
                bot.sendMessage(chatId, 'Ethereum, select a option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_eth_current_price' }]
                        ]
                    }
                })
                break;
            //gram menu
            case 'get_gram':
                bot.sendMessage(chatId, 'Gram, select a option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_gram_current_price' }]
                        ]
                    }
                })
                break;
            //btc current price
            case 'get_btc_current_price':
                let currentBitcoinPrice = await getBitcoinPrice();

                bot.sendMessage(chatId, `Current Bitcoin price: ${currentBitcoinPrice}$`);
                break;
            //eth current price
            case 'get_eth_current_price':
                let currentEthereumPrice = await getEthereumPrice();

                bot.sendMessage(chatId, `Current Ethereum price: ${currentEthereumPrice}$`);
                break;
            //gram current price
            case 'get_gram_current_price':
                let currentGramPrice = await getGramPrice();

                bot.sendMessage(chatId, `Current Gram price: ${currentGramPrice}$`);
                break;
            //default response, prevents the bot from crashing
            default:
                bot.sendMessage(chatId, 'Sorry, an error occurred.');
        }
    });

    setInterval(() => checkBitcoinPrice(bot), 30000);

    setInterval(() => checkEthereumPrice(bot), 30000);

    setInterval(() => checkGramPrice(bot), 30000);
}

module.exports = startBot;