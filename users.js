//This file contains functions for reading and writing user IDs
const fs = require('fs'); //file handling module
const { json } = require('stream/consumers');
const USERS = 'users.json';
//available coins
let availableCoins = ['BTC', 'ETH', 'GRAM'];

//function for reading file
function loadUsers() {
    if (!fs.existsSync(USERS)) return {}; //if file do not exists, return empty object
    return JSON.parse(fs.readFileSync(USERS, 'utf8'));
}

//function for saving users
function saveUser(chatId) {
    let users = loadUsers(); //get users file
    if (users[chatId]) return; //if users file already contains id, stop the function 

    users[chatId] = { coins: [...availableCoins] }; // add the new user
    fs.writeFileSync(USERS, JSON.stringify(users, null, 2)); // write the whole object back
}

//function for deleting users
function deleteUser(chatId) {
    let users = loadUsers(); //get users file
    if (!users[chatId]) return; //nothing to delete

    delete users[chatId]; //delete user
    fs.writeFileSync(USERS, JSON.stringify(users, null, 2)); //rewrite file
}

//function that delete coin from user preferences or add coin if it's not in user preferences
function deleteAddCoin(chatId, coin) {
    let users = loadUsers(); //get the list of users 
    if(!users[chatId]) return; //check if user exists 
    let userCoins = users[chatId].coins; //get list of user's coins

    if (users[chatId].coins.includes(coin)) {                               //if list contains coin => delete coin
        users[chatId] = { coins: userCoins.filter(c => c !=coin) };
    } else {                                                                //if not, add coin to the list
        users[chatId].coins.push(coin);
    }

    fs.writeFileSync(USERS, JSON.stringify(users, null, 2));                //rewrite users list 
}
module.exports = {
    loadUsers,
    saveUser,
    deleteUser,
    deleteAddCoin
}