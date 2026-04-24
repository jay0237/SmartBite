const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chatbotController");

// POST /api/chatbot/message
router.post("/message", sendMessage);

module.exports = router;
