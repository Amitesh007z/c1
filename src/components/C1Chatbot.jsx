import { useEffect, useRef } from 'react';

/**
 * C1Chatbot Component - Production Standard Bridge
 * This component handles the complex iframe-parent communication required for 
 * stable authentication on production environments (like Netlify).
 */
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

    // Approach A: Passing token directly (Recommended for Production)
    if (token) {
        params.append('token', token);
    }

    const embedUrl = `${baseUrl}?${params.toString()}`;

    useEffect(() => {
        const handleMessage = (event) => {
            // Only accept messages from the chatbot origin
            if (event.origin !== 'https://chat.crowd1.com') return;

            const { type, loginUrl } = event.data || {};
            console.log(`📬 [C1Chatbot Bridge] Received: ${type}`);

            switch (type) {
                case 'IFRAME_READY':
                    console.log('✨ [C1Chatbot] Iframe is ready - bridge established');
                    break;

                case 'REQUEST_AUTH':
                    console.log('🔐 [C1Chatbot] Bot requested auth status');
                    // Approach C: Parent responds to auth request
                    event.source.postMessage({
                        type: 'C1_AUTH_RESPONSE',
                        isAuthenticated: !!token,
                        user: null // If you had a real user object, you'd pass it here
                    }, event.origin);
                    break;

                case 'SSO_LOGIN':
                    // Approach B: Popup fallback
                    if (loginUrl) {
                        console.log('🚀 [C1Chatbot] Opening login popup via parent proxy');
                        const popup = window.open(loginUrl, 'C1AuthPopup', 'width=600,height=800');
                        if (!popup) console.error('❌ [C1Chatbot] Popup blocked by browser');
                    }
                    break;

                case 'C1_AUTH_SUCCESS':
                    console.log('✅ [C1Chatbot] Authentication Success received by parent');
                    // Forward successful auth message down to the chatbot iframe
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        console.log('➡️ [C1Chatbot] Forwarding success to iframe...');
                        iframeRef.current.contentWindow.postMessage(event.data, 'https://chat.crowd1.com');
                    }
                    break;

                case 'C1_AUTH_ERROR':
                    console.error('❌ [C1Chatbot] Authentication Error:', event.data.message);
                    break;

                default:
                    // Other messages like chat events or analytics
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [token]);

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
