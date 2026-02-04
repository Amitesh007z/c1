import { useEffect, useRef, useCallback } from 'react';

/**
 * C1Chatbot Component - Production Standard Bridge
 * Handles iframe-parent communication for auth on production environments (e.g. Netlify).
 * Supports guest chat + popup-based SSO login flow.
 */
function C1Chatbot({ selectedProject = 'combined_c1_all', token = '' }) {
    const iframeRef = useRef(null);
    const popupRef = useRef(null);
    const lastBlurTime = useRef(0);
    const reloadScheduled = useRef(false);

    // Clean the token: If the user pasted a string like "TOKEN&refresh_token=...", 
    // we only want the actual token part before the first '&'.
    const cleanToken = token ? token.split('&')[0].split('?token=')[1] || token.split('&')[0] : '';

    const baseUrl = 'https://chat.crowd1.com/embed';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Build the robust embed URL with all possible origin-trust parameters
    const params = new URLSearchParams({
        selected_project: selectedProject,
        show_login_button: 'true',
        origin: origin, // Crucial for whitelisting focus
        parent_url: typeof window !== 'undefined' ? window.location.href : '',
        embed_version: '2.0'
    });
    
    if (cleanToken) params.append('token', cleanToken);
    const embedUrl = `${baseUrl}?${params.toString()}`;

    const reloadIframe = useCallback(() => {
        if (iframeRef.current && !reloadScheduled.current) {
            reloadScheduled.current = true;
            console.log('🔄 [C1Chatbot] Syncing/Reloading iframe...');
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => {
                if (iframeRef.current) iframeRef.current.src = currentSrc;
                reloadScheduled.current = false;
            }, 100);
        }
    }, [embedUrl]);

    useEffect(() => {
        const handleFocus = () => {
            const blurDuration = Date.now() - lastBlurTime.current;
            // If return from popup (roughly > 3s), refresh the view
            if (lastBlurTime.current > 0 && blurDuration > 3000) {
                console.log('👁️ [C1Chatbot] Tab regained focus - refreshing state');
                setTimeout(reloadIframe, 1000); // Give it a second to settle
            }
            lastBlurTime.current = 0;
        };
        const handleBlur = () => { lastBlurTime.current = Date.now(); };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [reloadIframe]);

    useEffect(() => {
        const handleMessage = (event) => {
            // Only trust crowd1
            if (!event.origin.includes('crowd1.com')) return;

            const data = event.data || {};
            const { type, loginUrl } = data;
            
            // Check for potential token inside nested data if the redirect page tries to send it
            const potentialToken = data.token || data.id_token || data.payload?.token;

            console.log(`📬 [C1Chatbot] PostMessage: ${type}`, data);

            switch (type) {
                case 'IFRAME_READY':
                    console.log('✨ [C1Chatbot] Bridge connected');
                    break;

                case 'REQUEST_AUTH':
                    console.log('🔐 [C1Chatbot] Answering auth request');
                    event.source?.postMessage({
                        type: 'C1_AUTH_RESPONSE',
                        isAuthenticated: !!cleanToken,
                        token: cleanToken
                    }, event.origin);
                    break;

                case 'SSO_LOGIN':
                    if (loginUrl) {
                        console.log('🚀 [C1Chatbot] Opening login popup');
                        popupRef.current = window.open(loginUrl, 'C1AuthPopup', 'width=600,height=800');
                    }
                    break;

                case 'C1_AUTH_SUCCESS':
                case 'AUTH_SUCCESS':
                case 'LOGIN_SUCCESS':
                    console.log('✅ [C1Chatbot] Auth Success!');
                    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
                    reloadIframe();
                    break;

                default:
                    // If we see a token in any message, it might be the redirected success
                    if (potentialToken) {
                        console.log('🎫 [C1Chatbot] Token detected in message, reloading...');
                        reloadIframe();
                    }
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [cleanToken, reloadIframe]);

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
