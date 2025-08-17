// Test script để kiểm tra API lưu user
const { saveUserToDatabase } = require('./src/utils/userSaver');

async function testSaveUser() {
    console.log('🧪 Testing save user API...');
    
    const testUser = {
        facebook_id: 'test_bot_123',
        userProfile: {
            first_name: 'Bot',
            last_name: 'Test',
            profile_pic: 'https://graph.facebook.com/test_bot_123/picture'
        },
        messageText: 'Test message from bot'
    };
    
    try {
        const result = await saveUserToDatabase(
            testUser.facebook_id, 
            testUser.userProfile, 
            testUser.messageText
        );
        
        console.log('✅ Test successful!');
        console.log('Result:', result);
        
    } catch (error) {
        console.error('❌ Test failed!');
        console.error('Error:', error.message);
    }
}

// Run test
testSaveUser();
