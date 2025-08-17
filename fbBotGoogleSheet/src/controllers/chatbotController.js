require('dotenv').config();
const request = require("request");
const gameDatabase = require('../services/gameDatabase');
const { saveUserToDatabase } = require('../utils/userSaver');

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

let test = (req, res) => {
    return res.send("Hello again");
}

let getWebhook = (req, res) => {
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
}

let postWebhook = (req, res) => {
    let body = req.body;
    console.log("=== RECEIVED WEBHOOK ===");
    console.log("Body:", JSON.stringify(body, null, 2));

    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];

            console.log("=== WEBHOOK EVENT ===");
            console.log(JSON.stringify(webhook_event, null, 2));

            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            if (webhook_event.message) {
                console.log("=== HANDLING MESSAGE ===");
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                console.log("=== HANDLING POSTBACK ===");
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log("=== NOT A PAGE EVENT ===");
        res.sendStatus(404);
    }
}

function getUserProfile(sender_psid) {
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/v7.0/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
            "method": "GET"
        }, (err, res, body) => {
            if (!err) {
                let userProfile = JSON.parse(body);
                console.log('=== USER PROFILE ===');
                console.log(JSON.stringify(userProfile, null, 2));
                resolve(userProfile);
            } else {
                console.error("=== ERROR GETTING USER PROFILE ===");
                console.error("Error:", err);
                reject(err);
            }
        });
    });
}

async function handleMessage(sender_psid, received_message) {
    console.log("=== HANDLE MESSAGE FUNCTION ===");
    console.log("Sender PSID:", sender_psid);
    console.log("Received message:", JSON.stringify(received_message, null, 2));

    let response;
    
    let userProfile;
    try {
        userProfile = await getUserProfile(sender_psid);
    } catch (error) {
        console.error("Failed to get user profile:", error);
        userProfile = { first_name: "bạn" };
    }

    try {
        const messageText = received_message.text || received_message.attachments?.[0]?.type || 'attachment';
        await saveUserToDatabase(sender_psid, userProfile, messageText);
    } catch (saveError) {
        console.error("❌ Error saving user to web database:", saveError);
    }

    if (received_message.text) {
        console.log("=== TEXT MESSAGE DETECTED ===");
        console.log("Text content:", received_message.text);

        let gameLink = "https://quan3goc.page.gd";
        try {
            const token = await gameDatabase.createVerificationToken(sender_psid);
            gameLink = `https://quan3goc.page.gd/?token=${token}`;
            console.log("Created verification token:", token);
        } catch (error) {
            console.error("Error creating verification token:", error);
            gameLink = `https://quan3goc.page.gd/?psid=${encodeURIComponent(sender_psid)}`;
        }

        let userName = userProfile.first_name || "bạn";
        let welcomeMessage = `🎉 Chào mừng ${userName} đến với QUÁN 3 GÓC! 🎉

Cảm ơn ${userName} đã nhắn tin

🎮 Hãy thử trò chơi thú vị của chúng tôi tại:
👉 ${gameLink}

Chúc ${userName} chơi vui vẻ và hẹn gặp lại ${userName} tại quán! 🥤🍕`;
        
        response = {
            "text": welcomeMessage
        }

        console.log("=== SENDING RESPONSE ===");
        console.log("Response:", JSON.stringify(response, null, 2));

    } else if (received_message.attachments) {
        console.log("=== ATTACHMENT MESSAGE DETECTED ===");

        let attachment_url = received_message.attachments[0].payload.url;
        let attachment_type = received_message.attachments[0].type;
        let userName = userProfile.first_name || "bạn";

        if (attachment_type === 'image') {
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": `🎉 Cảm ơn ${userName} đã gửi hình ảnh!`,
                            "subtitle": `Chào mừng ${userName} đến QUÁN 3 GÓC! 🎮 Thử trò chơi của chúng tôi nhé!`,
                            "image_url": attachment_url,
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "title": "🎮 Chơi Game Ngay!",
                                    "url": "https://quan3goc.page.gd"
                                },
                                {
                                    "type": "postback",
                                    "title": "👍 Thích hình này!",
                                    "payload": "like_image"
                                }
                            ],
                        }]
                    }
                }
            }
        } else {
            response = {
                "text": `🎉 Cảm ơn ${userName} đã gửi ${attachment_type}! 

Chào mừng ${userName} đến với QUÁN 3 GÓC! 🎮

Thử trò chơi thú vị của chúng tôi tại:
👉 https://quan3goc.page.gd

Chúc ${userName} chơi vui vẻ! 🥤🍕`
            }
        }

        console.log("=== SENDING ATTACHMENT RESPONSE ===");
        console.log("Response:", JSON.stringify(response, null, 2));
        
    } else {
        console.log("=== OTHER MESSAGE TYPE DETECTED ===");
        let userName = userProfile.first_name || "bạn";
        response = {
            "text": `🎉 Xin chào ${userName}! Chào mừng ${userName} đến với QUÁN 3 GÓC! 

Cảm ơn ${userName} đã liên hệ với chúng tôi! 

🎮 Hãy thử trò chơi thú vị của quán tại:
👉 https://quan3goc.page.gd

Chúc ${userName} có những phút giây vui vẻ! 🥤🍕`
        }
    }

    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    console.log("=== HANDLE POSTBACK FUNCTION ===");
    console.log("Sender PSID:", sender_psid);
    console.log("Received postback:", JSON.stringify(received_postback, null, 2));

    let response;

    let payload = received_postback.payload;

    if (payload === 'yes') {
        response = { "text": "Cảm ơn bạn! Chúng tôi đã nhận được xác nhận." }
    } else if (payload === 'no') {
        response = { "text": "Xin lỗi, vui lòng thử gửi lại hình ảnh khác." }
    }

    console.log("=== SENDING POSTBACK RESPONSE ===");
    console.log("Response:", JSON.stringify(response, null, 2));

    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    console.log("=== CALL SEND API ===");
    console.log("Sender PSID:", sender_psid);
    console.log("Response to send:", JSON.stringify(response, null, 2));

    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    console.log("=== REQUEST BODY ===");
    console.log(JSON.stringify(request_body, null, 2));

    request({
        "uri": "https://graph.facebook.com/v7.0/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('=== MESSAGE SENT SUCCESSFULLY ===');
            console.log('Response body:', JSON.stringify(body, null, 2));
        } else {
            console.error("=== ERROR SENDING MESSAGE ===");
            console.error("Error:", err);
        }
    });
}

module.exports = {
    test: test,
    getWebhook: getWebhook,
    postWebhook: postWebhook
};