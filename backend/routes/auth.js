const express = require('express');
const router = express.Router();

const { getOAuthClient, createInitialSheets } = require('../services/google');
const User = require('../models/User');

const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
];


//  Step 1: Redirect to Google
router.get('/login', (req, res) => {
  const client = getOAuthClient();

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});


//  Step 2: OAuth Callback
router.get('/oauth2callback', async (req, res) => {
  try {
    const client = getOAuthClient();
    const { code } = req.query;

    // 1. Get tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // 2. Get user email
    const oauth2 = google.oauth2({
      auth: client,
      version: 'v2'
    });

    const userInfo = await oauth2.userinfo.v2.me.get();
    const email = userInfo.data.email;

    // 3. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        tokens
      });   

      // OPTIONAL: create sheet (can disable later)
      const sheetId = await createInitialSheets(client);

      user.sheets = {
        spreadsheetId: sheetId
      };

    } else {
      // update tokens safely
      user.tokens = {
        ...user.tokens,
        ...tokens
      };

      // ensure sheet exists
      if (!user.sheets?.spreadsheetId) {
        const sheetId = await createInitialSheets(client);

        user.sheets = {
          spreadsheetId: sheetId
        };
      }
    }

    await user.save();

    //  IMPORTANT: include userId
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        plan: user.plan
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // redirect with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${jwtToken}`);

  } catch (err) {
    console.error("OAuth Error:", err);
    res.status(500).send("Authentication failed");
  }
});

module.exports = router;