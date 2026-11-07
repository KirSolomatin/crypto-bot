//This file contains functions for reading and writing user IDs
const fs = require('fs'); //file handling module
const USERS = 'users.json';

//function for reading file
function loadUsers () {
    if (!fs.existsSync(USERS)) return []; //if file do not exists, return empty object
    return JSON.parse(fs.readFileSync(USERS, 'utf8'));
}

//function for saving users
function saveUser (chatId) {
    let users = loadUsers(); //get users file
    if (users.includes(chatId)) return; //if users file already contains id, stop the function 

    users.push(chatId); //ad new id in the end of list
    fs.writeFileSync(USERS, JSON.stringify(users, null, 2)); //write file with the new id
}

module.exports = {
    loadUsers,
    saveUser
}