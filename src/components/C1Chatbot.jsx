import { useEffect } from 'react';

function C1Chatbot({ selectedProject = 'combined_c1_all', token = '' }) {
    // Build the embed URL with origin/parent_url to help with redirect authorization
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const baseUrl = 'https://chat.crowd1.com/embed';
    const params = new URLSearchParams({
        selected_project: selectedProject,
        show_login_button: 'true',
        origin: origin,
        parent_url: origin
    });

    if (token) {
        params.append('token', token);
    }

    const embedUrl = `${baseUrl}?${params.toString()}`;

    useEffect(() => {
        const handleMessage = (event) => {
            // Only accept messages from the chatbot origin
            if (event.origin !== 'https://chat.crowd1.com') return;

            console.log('📬 [C1Chatbot] Message received:', event.data?.type, event.data);

            // Handle C1_AUTH_REQUEST: Internal login flow initialization
            if (event.data?.type === 'C1_AUTH_REQUEST') {
                console.log('🔐 [C1Chatbot] Responding to auth request (Guest Mode fallback)');
                // Responding tells the chatbot we are listening, which can help initialize the Channel ID
                event.source.postMessage({
                    type: 'C1_AUTH_RESPONSE',
                    isAuthenticated: false,
                    user: null
                }, event.origin);
            }

            // Handle C1_AUTH_SUCCESS: Close the hang and refresh state
            if (event.data?.type === 'C1_AUTH_SUCCESS') {
                console.log('✅ [C1Chatbot] User authenticated successfully');
                // Optional: You could trigger a state update in the parent app here
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
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation; identity-credentials-get; publickey-credentials-get"
            // Important: No sandbox, and no extra restrictions
            />
        </div>
    );
}

export default C1Chatbot;
