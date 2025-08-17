const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Test route
router.get('/test', chatbotController.test);

// Webhook verification route
router.get('/webhook', chatbotController.getWebhook);

// Webhook event handling route
router.post('/webhook', chatbotController.postWebhook);

module.exports = router;