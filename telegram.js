require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const { getBitcoinPrice, checkBitcoinPrice } = require('./crypto/bitcoin');
const { getEthereumPrice, checkEthereumPrice } = require('./crypto/ethereum');
const { getGramPrice, checkGramPrice } = require('./crypto/gram');
const { getGoldPrice, checkGoldPrice } = require('./metal/gold');
const { getSilverPrice, checkSilverPrice } = require('./metal/silver');
const { loadUsers, saveUser, deleteAddCoin } = require('./users');

async function startBot() {
    bot.setMyCommands([
        { command: '/start', description: 'Start the bot' },
        { command: '/menu', description: 'Bot menu' },
    ]);

    bot.on('polling_error', (error) => {
        console.error('Polling error:', error.code, error.message);
    }
    );

    bot.onText(/\/start/, async (msg) => {
        let chatId = msg.chat.id;
        saveUser(chatId);

        bot.sendMessage(chatId, "You're in! Alerts for BTC, ETH and GRAM are on. Use /menu to check prices or manage alerts.");
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
        const messageId = query.message.message_id;
        const users = loadUsers();

        if (!users[chatId]) {
            saveUser(chatId);
            users = loadUsers();
        }

        switch (query.data) {
            case 'get_crypto':
                bot.sendMessage(chatId, 'Select the coin:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'BTC', callback_data: 'get_btc' }],
                            [{ text: 'ETH', callback_data: 'get_eth' }],
                            [{ text: 'GRAM', callback_data: 'get_gram' }]
                        ]
                    }
                });
                break;

            case 'get_metal':
                bot.sendMessage(chatId, 'Select the metal', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Gold', callback_data: 'get_gold' }],
                            [{ text: 'Silver', callback_data: 'get_silver' }]
                        ]
                    }
                });
                break;
            //btc menu
            case 'get_btc':
                bot.sendMessage(chatId, 'Bitcoin, select an option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_btc_current_price' }],
                            [{ text: `Price alert  ${users[chatId].coins.includes("BTC") ? '🟢' : '🔴'}`, callback_data: 'btc_price_alert' }]
                        ]
                    }
                })
                break;
            //eth menu
            case 'get_eth':
                bot.sendMessage(chatId, 'Ethereum, select a option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_eth_current_price' }],
                            [{ text: `Price alert  ${users[chatId].coins.includes("ETH") ? '🟢' : '🔴'}`, callback_data: 'eth_price_alert' }]
                        ]
                    }
                });
                break;
            //gram menu
            case 'get_gram':
                bot.sendMessage(chatId, 'Gram, select a option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_gram_current_price' }],
                            [{ text: `Price alert  ${users[chatId].coins.includes("GRAM") ? '🟢' : '🔴'}`, callback_data: 'gram_price_alert' }]
                        ]
                    }
                });
                break;
            //gold menu
            case 'get_gold':
                bot.sendMessage(chatId, 'Gold, select an option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_gold_current_price' }],
                            [{ text: `Price alert  ${users[chatId].coins.includes("GOLD") ? '🟢' : '🔴'}`, callback_data: 'gold_price_alert' }]
                        ]
                    }
                })
                break;
            //silver menu
            case 'get_silver':
                bot.sendMessage(chatId, 'Silver, select an option:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Get the current price', callback_data: 'get_silver_current_price' }],
                            [{ text: `Price alert  ${users[chatId].coins.includes("SILVER") ? '🟢' : '🔴'}`, callback_data: 'silver_price_alert' }]
                        ]
                    }
                })
                break;
            //btc current price
            case 'get_btc_current_price':
                let currentBitcoinPrice = await getBitcoinPrice();

                bot.sendMessage(chatId, `Current Bitcoin price: ${currentBitcoinPrice}$`);
                break;
            // on or off bitcoin price alerts
            case 'btc_price_alert': {
                deleteAddCoin(chatId, "BTC");
                let users = loadUsers();

                try {
                    await bot.editMessageReplyMarkup(
                        {
                            inline_keyboard: [
                                [{ text: 'Get the current price', callback_data: 'get_btc_current_price' }],
                                [{ text: `Price alert ${users[chatId].coins.includes("BTC") ? '🟢' : '🔴'}`, callback_data: 'btc_price_alert' }]
                            ],
                        },
                        { chat_id: chatId, message_id: messageId }
                    );
                } catch (error) {
                    const description = error.response?.body?.description || "";
                    if (!description.includes("message is not modified")) {
                        console.error(error.message);
                    }
                }
                break;
            }
            //eth current price
            case 'get_eth_current_price':
                let currentEthereumPrice = await getEthereumPrice();

                bot.sendMessage(chatId, `Current Ethereum price: ${currentEthereumPrice}$`);
                break;
            // on or off ethereum price alerts
            case 'eth_price_alert': {
                deleteAddCoin(chatId, "ETH");
                let users = loadUsers();

                try {
                    await bot.editMessageReplyMarkup(
                        {
                            inline_keyboard: [
                                [{ text: 'Get the current price', callback_data: 'get_eth_current_price' }],
                                [{ text: `Price alert  ${users[chatId].coins.includes("ETH") ? '🟢' : '🔴'}`, callback_data: 'eth_price_alert' }]
                            ],
                        },
                        { chat_id: chatId, message_id: messageId }
                    );
                } catch (error) {
                    const description = error.response?.body?.description || "";
                    if (!description.includes("message is not modified")) {
                        console.error(error.message);
                    }
                }
                break;
            }
            //gram current price
            case 'get_gram_current_price':
                let currentGramPrice = await getGramPrice();

                bot.sendMessage(chatId, `Current Gram price: ${currentGramPrice}$`);
                break;
            //on or off gram price alert
            case 'gram_price_alert': {
                deleteAddCoin(chatId, "GRAM");
                let users = loadUsers();

                try {
                    await bot.editMessageReplyMarkup(
                        {
                            inline_keyboard: [
                                [{ text: 'Get the current price', callback_data: 'get_gram_current_price' }],
                                [{ text: `Price alert  ${users[chatId].coins.includes("GRAM") ? '🟢' : '🔴'}`, callback_data: 'gram_price_alert' }]
                            ],
                        },
                        { chat_id: chatId, message_id: messageId }
                    );
                } catch (error) {
                    const description = error.response?.body?.description || "";
                    if (!description.includes("message is not modified")) {
                        console.error(error.message);
                    }
                }
                break;
            }
            //gold current price
            case 'get_gold_current_price':
                let currentGoldPrice = await getGoldPrice();

                bot.sendMessage(chatId, `Current Gold price: ${currentGoldPrice}$`);
                break;
            //on or off gold price alert
            case 'gold_price_alert': {
                deleteAddCoin(chatId, "GOLD"); //add or delete currency to the preference sheet of user 
                let users = loadUsers(); //get updated sheet

                //trys to edit sent message to update state of alerts in chat
                try {
                    await bot.editMessageReplyMarkup(
                        {
                            inline_keyboard: [
                                [{ text: 'Get the current price', callback_data: 'get_gold_current_price' }],
                                [{ text: `Price alert  ${users[chatId].coins.includes("GOLD") ? '🟢' : '🔴'}`, callback_data: 'gold_price_alert' }]
                            ],
                        },
                        { chat_id: chatId, message_id: messageId }
                    );
                } catch (error) {                                                       //sends a message of error if something went wrong
                    const description = error.response?.body?.description || "";
                    if (!description.includes("message is not modified")) {
                        console.error(error.message);
                    }
                }
                break;
            }
            //silver current price
            case 'get_silver_current_price':
                let currentSilverPrice = await getSilverPrice();

                bot.sendMessage(chatId, `Current Silver price: ${currentSilverPrice}$`);
                break;
            //on or off silver price alert
            case 'silver_price_alert': {
                deleteAddCoin(chatId, "SILVER"); //add or delete currency to the preference sheet of user 
                let users = loadUsers(); //get updated sheet

                //trys to edit sent message to update state of alerts in chat
                try {
                    await bot.editMessageReplyMarkup(
                        {
                            inline_keyboard: [
                                [{ text: 'Get the current price', callback_data: 'get_silver_current_price' }],
                                [{ text: `Price alert  ${users[chatId].coins.includes("SILVER") ? '🟢' : '🔴'}`, callback_data: 'silver_price_alert' }]
                            ],
                        },
                        { chat_id: chatId, message_id: messageId }
                    );
                } catch (error) {                                                       //sends a message of error if something went wrong
                    const description = error.response?.body?.description || "";
                    if (!description.includes("message is not modified")) {
                        console.error(error.message);
                    }
                }
                break;
            }
            //default response, prevents the bot from crashing
            default:
                bot.sendMessage(chatId, 'Sorry, an error occurred.');
        }

        bot.answerCallbackQuery(query.id);
    });

    setInterval(() => checkBitcoinPrice(bot), 30000);

    setInterval(() => checkEthereumPrice(bot), 30000);

    setInterval(() => checkGramPrice(bot), 30000);

    setInterval(() => checkGoldPrice(bot), 30000);

    setInterval(() => checkSilverPrice(bot), 30000);
}

module.exports = startBot;