const axios = require('axios');

async function getBitcoinPrice () {
    const bitcoin = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"); 
    return Number(bitcoin.data.price).toFixed(3);
}

async function getEthereumPrice () {
    const ethereum = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
    return Number(ethereum.data.price).toFixed(3);
}

async function getGramPrice () {
    const gram = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=GRAMUSDT");
    return Number(gram.data.price).toFixed(3); 
}

module.exports = {
    getBitcoinPrice,
    getEthereumPrice,
    getGramPrice
};