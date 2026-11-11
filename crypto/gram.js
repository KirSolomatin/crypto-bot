const axios = require('axios');
let lastGramPrice = null;

const { loadUsers, deleteUser } = require('../users');

//function that get a current gram price, uses binance api
async function getGramPrice() {
    const gram = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=GRAMUSDT");
    return Number(gram.data.price).toFixed(2);
}

//A function that checks for price changes; if the change is greater than 0.5 percent, it sends the price
async function checkGramPrice(bot) {
    let users = loadUsers(); //request a list of users for send a price
    const currentGramPrice = await getGramPrice(); //get current price
    const diff = ((currentGramPrice - lastGramPrice) / lastGramPrice) * 100; //calculates the difference as a percentage

    //if the difference is greater than 0.5
    if (Math.abs(diff) > 0.5) {
        for (const user of users) {
            try {
                //Sends new price to every user
                await bot.sendMessage(user, `Gram changed ${diff.toFixed(2)}%, current price: ${currentGramPrice}$`)
            } catch (error) {
                console.error(`Can't send the message to user ${user}`, error.message);
                
                // 403: bot was blocked or kicked, 400 "chat not found": chat does not exist
                const description = error.response?.body?.description || error.message;
                const errorCode = error.response?.body?.error_code;

                if (errorCode === 403 || description.includes('chat not found')) {
                    deleteUser(user);
                }
            }
        }
        //updates price
        lastGramPrice = currentGramPrice;
    }
}

module.exports = {
    getGramPrice,
    checkGramPrice
}