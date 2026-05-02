const express = require('express');
const router = express.Router();


router.get('/wakeup', async (req,res) => {
    res.json({
        message: "service is waking up...",
    });
})

module.exports = router;