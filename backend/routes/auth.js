const express = require('express');
const router = express.Router();
const { getOAuthClient } = require('../services/google');
const User = require('../models/User');
const { createInitialSheets } = require('../services/google');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
];

// Step 1: Redirect user to Google
router.get('/login', (req, res) => {
  const client = getOAuthClient();

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

// Step 2: Callback
router.get('/oauth2callback', async (req, res) => {
  try {
    const client = getOAuthClient();

    const { code } = req.query;

    // Step 1: Get tokens
    const { tokens } = await client.getToken(code);

    // console.log(tokens)

    client.setCredentials(tokens);

    // Step 2: Get user email
    const oauth2 = google.oauth2({
      auth: client,
      version: 'v2'
    });

    const userInfo = await oauth2.userinfo.v2.me.get();
    const email = userInfo.data.email;

    // Step 3: Find or create user
    let user = await User.findOne({ email });

    if (!user) {
        // First time user
        user = new User({ email, tokens });

        const sheetId = await createInitialSheets(client);

        user.sheets = {
            spreadsheetId: sheetId
        };

    } else {
        // Existing user
        user.tokens = {
            ...user.tokens,
            ...tokens
        };

        // Only create sheet if missing
        if (!user.sheets || !user.sheets.spreadsheetId) {
            const sheetId = await createInitialSheets(client);

            user.sheets = {
                spreadsheetId: sheetId
            };
        }
    }

    await user.save();
    console.log("User saved:", email);

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`http://localhost:5173/login?token=${token}`);

    // res.json({
    //   message: "Login successful",
    //   jwttoken
    // })


  } catch (err) {
    console.error("OAuth Error:", err);
    res.status(500).send("Authentication failed");
  }
});

module.exports = router;