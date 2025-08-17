const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    psid: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    messageText: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function saveUserToDatabase(psid, userProfile, messageText) {
    const user = new User({
        psid: psid,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        messageText: messageText
    });

    try {
        await user.save();
        console.log('User saved to database:', user);
    } catch (error) {
        console.error('Error saving user to database:', error);
    }
}

module.exports = {
    saveUserToDatabase
};