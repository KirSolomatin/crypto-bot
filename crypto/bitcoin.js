const axios = require('axios');
let lastBitcoinPrice = null;

const { loadUsers, deleteUser } = require('../users');

//function that get a current btc price, uses binance api
async function getBitcoinPrice() {
    const bitcoin = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    return Number(bitcoin.data.price).toFixed(2);
}

//A function that checks for price changes; if the change is greater than 0.5 percent, it sends the price
async function checkBitcoinPrice(bot) {
    let users = loadUsers(); //request a list of users for send a price
    const currentBitcoinPrice = await getBitcoinPrice(); //get current price
    const diff = ((currentBitcoinPrice - lastBitcoinPrice) / lastBitcoinPrice) * 100; //calculates the difference as a percentage

    //if the difference is greater than 0.5
    if (Math.abs(diff) > 0.5) {
        for (const [chatId, data] of Object.entries(users)) {
            try {
                //Sends new price to every user
                await bot.sendMessage(chatId, `Bitcoin changed ${diff.toFixed(2)}%, current price: ${currentBitcoinPrice}$`)
            } catch (error) {
                console.error(`Can't send the message to user ${chatId}`, error.message);

                // 403: bot was blocked or kicked, 400 "chat not found": chat does not exist
                const description = error.response?.body?.description || error.message;
                const errorCode = error.response?.body?.error_code;

                if (errorCode === 403 || description.includes('chat not found')) {
                    deleteUser(chatId);
                }
            }
        }
        //updates price
        lastBitcoinPrice = currentBitcoinPrice;
    }
}

module.exports = {
    getBitcoinPrice,
    checkBitcoinPrice
}