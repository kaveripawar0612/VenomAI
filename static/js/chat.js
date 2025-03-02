document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const messageForm = document.querySelector('#message-form');
    const messageInput = document.querySelector('#message-input');
    const typingIndicator = document.querySelector('.typing-indicator');

    function formatTimestamp(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function addMessage(content, isUser = false, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} ${isError ? 'error-message' : ''}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = formatTimestamp(new Date());

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timestamp);
        chatMessages.appendChild(messageDiv);

        // Smooth scroll to bottom
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });

        // Add focus back to input after bot response
        if (!isUser) {
            messageInput.focus();
        }
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const message = messageInput.value.trim();
        if (!message) return;

        // Disable input and button while processing
        messageInput.disabled = true;
        messageForm.querySelector('button').disabled = true;

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
                addMessage(data.error || 'An error occurred. Please try again.', false, true);
            }
        } catch (error) {
            hideTypingIndicator();
            addMessage('An error occurred. Please try again.', false, true);
            console.error('Error:', error);
        } finally {
            // Re-enable input and button
            messageInput.disabled = false;
            messageForm.querySelector('button').disabled = false;
            messageInput.focus();
        }
    });

    // Add initial greeting with slight delay
    setTimeout(() => {
        addMessage("Hello! I'm Venom, your AI assistant. How can I help you today?");
    }, 500);

    // Focus input on page load
    messageInput.focus();
});