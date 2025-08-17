# fbBotGoogleSheet

This project is a Facebook Messenger chatbot that interacts with users and provides a gaming experience. It is built using Node.js and Express, and it integrates with the Facebook Messenger API.

## Project Structure

```
fbBotGoogleSheet
├── src
│   ├── controllers
│   │   └── chatbotController.js
│   ├── services
│   │   └── gameDatabase.js
│   ├── utils
│   │   └── userSaver.js
│   ├── routes
│   │   └── webhook.js
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── Dockerfile
├── ecosystem.config.js
└── README.md
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd fbBotGoogleSheet
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Environment Variables**:
   - Copy `.env.example` to `.env` and fill in the required values:
     ```
     cp .env.example .env
     ```

4. **Run the application**:
   ```
   npm start
   ```

## Usage

- The chatbot will respond to messages sent to the Facebook page linked to the application.
- Users can interact with the bot and receive game links and personalized messages.

## Deployment

- The application can be deployed using Docker or PM2. Refer to the `Dockerfile` and `ecosystem.config.js` for deployment instructions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.