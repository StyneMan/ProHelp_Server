const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Replace with your details
const teamId = 'FC83X544J5'; // Your Apple Developer Team ID
const clientId = 'com.prohelpng.applelogin.app'; // Your Service ID (also known as Client ID)
const keyId = '9U8YMG5H7U'; // Your Key ID
const privateKey = fs.readFileSync(path.join(__dirname, './utils/AuthKey_9U8YMG5H7U.p8')); // Path to the downloaded .p8 file

const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: teamId,
  iat: now,
  exp: now + 86400 * 180, // Token valid for 180 days
  aud: 'https://appleid.apple.com',
  sub: clientId,
};

const token = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  keyid: keyId,
});

console.log(token);
