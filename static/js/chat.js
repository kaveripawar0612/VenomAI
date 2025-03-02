document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const messageForm = document.querySelector('#message-form');
    const messageInput = document.querySelector('#message-input');
    const typingIndicator = document.querySelector('.typing-indicator');

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        messageInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            hideTypingIndicator();

            if (response.ok) {
                addMessage(data.response);
            } else {
                addMessage('An error occurred. Please try again.');
            }
        } catch (error) {
            hideTypingIndicator();
            addMessage('An error occurred. Please try again.');
            console.error('Error:', error);
        }
    });

    // Add initial greeting with slight delay
    setTimeout(() => {
        addMessage("Hello! I'm Venom, your AI assistant. How can I help you today?");
    }, 500);
});