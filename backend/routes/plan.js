const authMiddleware = require("../middleware/authmiddleware");
const express = require('express');
const router = express.Router();

router.post("/plan", authMiddleware, async (req, res) => {
  req.user.plan = "PRO";
  req.user.planExpiresAt = new Date(Date.now() + 30*24*60*60*1000);

  await req.user.save();

  res.json({ message: "Upgraded to PRO" });
});

module.exports = router;