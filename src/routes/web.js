const express = require("express");
const chatbotController = require("../controllers/chatbotController");
const gameController = require("../controllers/gameController");
const userController = require("../controllers/userController");

console.log("chatbotController:", chatbotController);
console.log("chatbotController.test:", chatbotController.test);

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", chatbotController.test);
    router.get("/webhook", chatbotController.getWebhook);
    router.post("/webhook", chatbotController.postWebhook);
    
    // Game API routes
    router.post("/api/game/create-link", gameController.createGameLink);
    router.post("/api/game/save-user", gameController.saveUserFromGame);
    
    // User management API routes
    router.post("/api/save-contact", userController.saveContact);
    router.get("/api/users", userController.getAllUsers);
    router.post("/api/save-prize", userController.savePrize);
    router.put("/api/prize-status/:userPrizeId", userController.updatePrizeStatus);
    router.get("/api/prizes", userController.getPrizes);
    router.get("/api/user-prizes/:psid", userController.getUserPrizes);
    
    return app.use("/", router);
}

module.exports = initWebRoutes;