import { useEffect } from 'react';

function C1Chatbot({ selectedProject = 'combined_c1_all' }) {
    // Build the embed URL exactly as shown in the config tool
    const embedUrl = `https://chat.crowd1.com/embed?selected_project=${selectedProject}&show_login_button=true`;

    useEffect(() => {
        const handleMessage = (event) => {
            // Only accept messages from the chatbot origin
            if (event.origin !== 'https://chat.crowd1.com') return;

            console.log('📬 [C1Chatbot] Message received:', event.data?.type, event.data);

            // Handle C1_AUTH_REQUEST: Tell the chatbot no parent-side auth is available
            if (event.data?.type === 'C1_AUTH_REQUEST') {
                console.log('🔐 [C1Chatbot] Responding to auth request (Guest Mode)');
                event.source.postMessage({
                    type: 'C1_AUTH_RESPONSE',
                    isAuthenticated: false,
                    user: null
                }, event.origin);
            }

            // Optional: Log success
            if (event.data?.type === 'C1_AUTH_SUCCESS') {
                console.log('✅ [C1Chatbot] User authenticated successfully');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="c1-chatbot-container">
            <iframe
                id="c1-chatbot-iframe"
                src={embedUrl}
                title="C1 Chatbot"
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
        </div>
    );
}

export default C1Chatbot;
