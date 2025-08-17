require('dotenv').config();
const request = require("request");
const databaseService = require('../services/databaseService');

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

let test = (req, res) => {
    return res.send("Hello again");
}

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

let postWebhook = (req, res) => {
    let body = req.body;
    console.log("=== RECEIVED WEBHOOK ===");
    console.log("Body:", JSON.stringify(body, null, 2));

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
        // Iterates over each entry there may be multiple if batched
        body.entry.forEach(function (entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];

            console.log("=== WEBHOOK EVENT ===");
            console.log(JSON.stringify(webhook_event, null, 2));

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                console.log("=== HANDLING MESSAGE ===");
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                console.log("=== HANDLING POSTBACK ===");
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log("=== NOT A PAGE EVENT ===");
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

// Function to get user profile information
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

// Handles messages events
async function handleMessage(sender_psid, received_message) {
    console.log("=== HANDLE MESSAGE FUNCTION ===");
    console.log("Sender PSID:", sender_psid);
    console.log("Received message:", JSON.stringify(received_message, null, 2));

    let response;
    
    // Get user profile to personalize message
    let userProfile;
    try {
        userProfile = await getUserProfile(sender_psid);
        
        // Lưu thông tin user vào database
        await databaseService.saveUser(sender_psid, userProfile);
        console.log('✅ User saved to database');
        
    } catch (error) {
        console.error("Failed to get user profile:", error);
        userProfile = { first_name: "bạn" }; // fallback
    }

    // Check if the message contains text
    if (received_message.text) {
        console.log("=== TEXT MESSAGE DETECTED ===");
        console.log("Text content:", received_message.text);

        // Tạo verification token cho user
        let gameLink = "https://quan3goc.page.gd";
        try {
            const token = await databaseService.createVerificationToken(sender_psid);
            gameLink = `https://quan3goc.page.gd/?token=${token}`;
            console.log("Created verification token:", token);
        } catch (error) {
            console.error("Error creating verification token:", error);
            // Fallback to simple link with psid
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

        // Gets the URL of the message attachment
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
            // Trả lời cho video, audio, file khác với link game
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
        // Trả lời cho mọi loại tin nhắn khác (sticker, quick reply, v.v.)
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

    // Sends the response message
    callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    console.log("=== HANDLE POSTBACK FUNCTION ===");
    console.log("Sender PSID:", sender_psid);
    console.log("Received postback:", JSON.stringify(received_postback, null, 2));

    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Cảm ơn bạn! Chúng tôi đã nhận được xác nhận." }
    } else if (payload === 'no') {
        response = { "text": "Xin lỗi, vui lòng thử gửi lại hình ảnh khác." }
    }

    console.log("=== SENDING POSTBACK RESPONSE ===");
    console.log("Response:", JSON.stringify(response, null, 2));

    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    console.log("=== CALL SEND API ===");
    console.log("Sender PSID:", sender_psid);
    console.log("Response to send:", JSON.stringify(response, null, 2));

    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    console.log("=== REQUEST BODY ===");
    console.log(JSON.stringify(request_body, null, 2));

    // Send the HTTP request to the Messenger Platform
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
