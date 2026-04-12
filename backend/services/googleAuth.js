require('dotenv').config(); 
const { google } = require('googleapis');

function getAuthClient(tokens) {
  const client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  client.setCredentials(tokens);

  return client;
}

module.exports = { getAuthClient };