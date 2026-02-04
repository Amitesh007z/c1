import { useEffect, useRef } from 'react';

function C1Chatbot({ selectedProject = 'combined_c1_all', token = '' }) {
    const iframeRef = useRef(null);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    // Build the embed URL
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

            // 1. Handle C1_AUTH_REQUEST
            if (event.data?.type === 'C1_AUTH_REQUEST') {
                event.source.postMessage({
                    type: 'C1_AUTH_RESPONSE',
                    isAuthenticated: false,
                    user: null
                }, event.origin);
            }

            // 2. Handle SSO_LOGIN fallback (The "Parent Proxy" Fix)
            // When the iframe is blocked from opening popups, it asks the parent to do it.
            if (event.data?.type === 'SSO_LOGIN' && event.data.loginUrl) {
                console.log('🚀 [C1Chatbot] Proxying SSO Login to parent window');
                window.open(event.data.loginUrl, 'C1AuthPopup', 'width=600,height=800');
            }

            // 3. Handle C1_AUTH_SUCCESS
            // If the popup was opened by the parent, the success message comes here first.
            // We must forward it down to the iframe so the chatbot knows it's logged in.
            if (event.data?.type === 'C1_AUTH_SUCCESS') {
                console.log('✅ [C1Chatbot] Login Success! Forwarding to iframe...');
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(event.data, 'https://chat.crowd1.com');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="c1-chatbot-container">
            <iframe
                ref={iframeRef}
                id="c1-chatbot-iframe"
                src={embedUrl}
                title="C1 Chatbot"
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation; identity-credentials-get; publickey-credentials-get"
            />
        </div>
    );
}

export default C1Chatbot;
