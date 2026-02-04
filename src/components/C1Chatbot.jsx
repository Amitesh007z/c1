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
            console.log(`📬 [C1Chatbot Bridge] Received: ${type}`, event.data);

            switch (type) {
                case 'IFRAME_READY':
                    console.log('✨ Chatbot iframe is ready and registered');
                    break;

                case 'REQUEST_AUTH':
                    console.log('🔐 Responding to auth initialization');
                    event.source.postMessage({
                        type: 'C1_AUTH_RESPONSE',
                        isAuthenticated: !!token,
                        user: null // In production, you could pass user details here if authenticated
                    }, event.origin);
                    break;

                case 'SSO_LOGIN':
                    // Critical Fix: If the iframe's internal popup is blocked, the parent opens it.
                    if (loginUrl) {
                        console.log('🚀 Proxying SSO login to parent window');
                        window.open(loginUrl, 'C1AuthPopup', 'width=600,height=800');
                    }
                    break;

                case 'C1_AUTH_SUCCESS':
                    console.log('✅ Authentication Successful! Catching and forwarding to iframe.');
                    // If the popup was opened by the parent, the success message comes here.
                    // We must forward it down into the iframe so the chatbot logs in.
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        iframeRef.current.contentWindow.postMessage(event.data, 'https://chat.crowd1.com');
                    }
                    break;

                case 'C1_AUTH_ERROR':
                    console.error('❌ Authentication Error:', event.data.message);
                    break;

                default:
                    // Log other messages for debugging
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
