const axios = require('axios');
let lastEthereumPrice = null;

const { loadUsers } = require ('../users');

//function that get a current eth price, uses binance api
async function getEthereumPrice () {
    const ethereum = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"); 
    return Number(ethereum.data.price).toFixed(3);
}

//A function that checks for price changes; if the change is greater than 0.5 percent, it sends the price
async function checkEthereumPrice (bot) {
    let users = loadUsers(); //request a list of users for send a price
        const currentEthereumPrice = await getEthereumPrice(); //get current price
        const diff = ((currentEthereumPrice - lastEthereumPrice) / lastEthereumPrice) * 100; //calculates the difference as a percentage

        //if the difference is greater than 0.5
        if (Math.abs(diff) > 0.5) {
            for (const user of users) {
                try {
                    //Sends new price to every user
                    await bot.sendMessage(user, `Ethereum changed ${diff.toFixed(2)}%, current price: ${currentEthereumPrice}$`)
                } catch (error) {
                    console.error(`Can't send the message to user ${user}`, error.message);
                }
            }
            //updates price
            lastEthereumPrice = currentEthereumPrice;
        }
}

module.exports = {
    getEthereumPrice,
    checkEthereumPrice
}