import os
import logging
import time
from flask import Flask, render_template, request, jsonify
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")

# Initialize OpenAI client
openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.route('/')
def home():
    return render_template('index.html')

def create_chat_completion(messages, max_retries=3, initial_wait=1):
    """Create a chat completion with retry logic"""
    for attempt in range(max_retries):
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            if "rate limit" in str(e).lower():  # Rate limit error
                if attempt < max_retries - 1:
                    wait_time = initial_wait * (2 ** attempt)  # Exponential backoff
                    logger.warning(f"Rate limit hit, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
            logger.error(f"OpenAI API error: {str(e)}")
            raise

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message', '')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        messages = [
            {
                "role": "system",
                "content": "You are Venom, a helpful AI assistant created by Kaveri Pawar. "
                "Respond in a friendly and conversational manner like in a chat app."
            },
            {"role": "user", "content": user_message}
        ]

        try:
            ai_response = create_chat_completion(messages)
            return jsonify({'response': ai_response})
        except Exception as e:
            error_msg = str(e).lower()
            if "rate limit" in error_msg:
                return jsonify({
                    'error': 'I\'m getting a lot of messages right now. Please try again in a moment.'
                }), 429
            logger.error(f"Error in chat endpoint: {str(e)}")
            return jsonify({
                'error': 'Something went wrong. Please try again in a moment.'
            }), 500

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'An error occurred processing your request'}), 500