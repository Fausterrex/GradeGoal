# Environment Variables

## Required Environment Variables

### Groq API Configuration
- `VITE_GROQ_API_KEY`: Your Groq API key for DeepSeek chat model access

### Backend API Configuration  
- `VITE_API_BASE_URL`: Base URL for your backend API (default: http://localhost:8080)

## Setup Instructions

1. Create a `.env` file in the root directory of your React project
2. Add your Groq API key:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_API_BASE_URL=http://localhost:8080
   ```
3. Restart your development server after adding environment variables

## Getting Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Model Information

- **Model**: `deepseek-chat`
- **Provider**: Groq
- **API Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Max Tokens**: 8192
- **Temperature**: 0.7
