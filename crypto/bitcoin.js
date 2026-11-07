const axios = require('axios');
let lastBitcoinPrice = null;

const { loadUsers } = require ('../users');

//function that get a current btc price, uses binance api
async function getBitcoinPrice () {
    const bitcoin = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"); 
    return Number(bitcoin.data.price).toFixed(3);
}

//A function that checks for price changes; if the change is greater than 0.5 percent, it sends the price
async function checkBitcoinPrice (bot) {
    let users = loadUsers(); //request a list of users for send a price
        const currentBitcoinPrice = await getBitcoinPrice(); //get current price
        const diff = ((currentBitcoinPrice - lastBitcoinPrice) / lastBitcoinPrice) * 100; //calculates the difference as a percentage

        //if the difference is greater than 0.5
        if (Math.abs(diff) > 0.5) {
            for (const user of users) {
                try {
                    //Sends new price to every user
                    await bot.sendMessage(user, `Bitcoin changed ${diff.toFixed(2)}%, current price: ${currentBitcoinPrice}$`)
                } catch (error) {
                    console.error(`Can't send the message to user ${user}`, error.message);
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