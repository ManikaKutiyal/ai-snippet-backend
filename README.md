# AI Snippet — Backend

API Live URL: https://ai-snippet-backend.vercel.app/

This is the **backend service** for the AI Snippet project.  
It provides API endpoints that accept user prompts and return **AI-generated code or content snippets**. The backend handles prompt processing, AI integration, and structured JSON responses for the frontend application.

---

## ✨ Features

- REST API for snippet generation
- AI / LLM prompt → code/content generation
- Clean & structured JSON responses
- CORS enabled for frontend integrations
- Lightweight, fast deployment on Vercel
- Environment-based configuration

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- JavaScript
- OpenAI / LLM API integration
- dotenv for environment variables

---

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/ManikaKutiyal/ai-snippet-backend.git

# Enter the folder
cd ai-snippet-backend

# Install dependencies
npm install

# Configure environment variables
touch .env

Add your API key:

PORT=5000
OPENAI_API_KEY=your_api_key_here

# Start the server
npm start


Backend will run at:

http://localhost:5000

🔌 Example API Endpoint
POST /generate

Request Body

{
  "prompt": "Write a JavaScript function to reverse a string"
}


Response

{
  "snippet": "function reverseString(str) { return str.split('').reverse().join(''); }"
}

🔗 Frontend Integration

This backend is consumed by:

Frontend App:
https://github.com/ManikaKutiyal/ai-snippet-frontend

The frontend sends prompt requests to this API and displays AI-generated snippets to users in real time.

👩‍💻 Author

Manika Kutiyal
