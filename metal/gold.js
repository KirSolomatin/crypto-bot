const axios = require('axios');
let lastGoldPrice = null;

const { loadUsers, deleteUser } = require('../users');

//function that get a current price, uses binance api
async function getGoldPrice() {
    const gold = await axios.get("https://xaus.com/api/v1/spot");
    return Number(gold.data.spot_usd_oz).toFixed(2);
}

//A function that checks for price changes; if the change is greater than 0.5 percent, it sends the price
async function checkGoldPrice(bot) {
    let users = loadUsers(); //request a list of users for send a price
    const currentGoldPrice = await getGoldPrice(); //get current price
    const diff = ((currentGoldPrice - lastGoldPrice) / lastGoldPrice) * 100; //calculates the difference as a percentage

    //When the bot is launched for the first time, it should not send “changed Infinity%” 
    if (lastGoldPrice === null) {
        lastGoldPrice = currentGoldPrice;
        return;
    }

    //if the difference is greater than 0.5
    if (Math.abs(diff) > 0.5) {
        for (const [chatId, data] of Object.entries(users)) {
            if (data.coins.includes("GOLD")) {
                try {
                    //Sends new price to every user
                    await bot.sendMessage(chatId, `Gold changed ${diff.toFixed(2)}%, current price: ${currentGoldPrice}$`)
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
        }
        //updates price
        lastGoldPrice = currentGoldPrice;
    }
}

module.exports = {
    getGoldPrice,
    checkGoldPrice
}