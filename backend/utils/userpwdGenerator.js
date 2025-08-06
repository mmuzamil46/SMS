const User = require('../models/user');

const generateUsername = async (firstName, fathersName) => {
  const baseUsername = (
    firstName.charAt(0) + fathersName.replace(/\s+/g, '')
  ).toLowerCase();
let username = baseUsername;
let counter =1;
while(await User.exists({username})){
  username = `${baseUsername}${counter++}`;
}

return username;

}

const generatePwd = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
   for(let i=0; i<8; i++){
    password += chars.charAt(Math.floor(Math.random()* chars.length))
   }
   return password;
}

module.exports = {generateUsername, generatePwd};