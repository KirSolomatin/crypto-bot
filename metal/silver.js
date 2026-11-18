const axios = require('axios');
let lastSilverPrice = null;

const { loadUsers, deleteUser } = require('../users');

//function that get a current price, uses xaus api
async function getSilverPrice() {
    const silver = await axios.get("https://xaus.com/api/v1/spot");
    return Number(silver.data.silver_usd_oz).toFixed(2);
}

//A function that checks for price changes; if the change is greater than 0.5 percent, it sends the price
async function checkSilverPrice(bot) {
    let users = loadUsers(); //request a list of users for send a price
    const currentSilverPrice = await getSilverPrice(); //get current price
    const diff = ((currentSilverPrice - lastSilverPrice) / lastSilverPrice) * 100; //calculates the difference as a percentage

    //When the bot is launched for the first time, it should not send “changed Infinity%” 
    if (lastSilverPrice === null) {
        lastSilverPrice = currentSilverPrice;
        return;
    }

    //if the difference is greater than 0.5
    if (Math.abs(diff) > 0.5) {
        for (const [chatId, data] of Object.entries(users)) {
            if (data.coins.includes("SILVER")) {
                try {
                    //Sends new price to every user
                    await bot.sendMessage(chatId, `Silver changed ${diff.toFixed(2)}%, current price: ${currentSilverPrice}$ per troy ounce`)
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
        lastSilverPrice = currentSilverPrice;
    }
}

module.exports = {
    getSilverPrice,
    checkSilverPrice
}