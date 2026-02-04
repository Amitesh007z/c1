import { useEffect, useRef, useCallback } from 'react';

/**
 * C1Chatbot Component - Production Standard Bridge
 * Handles iframe-parent communication for auth on production environments (e.g. Netlify).
 * Supports guest chat + popup-based SSO login flow.
 */
function C1Chatbot({ selectedProject = 'combined_c1_all', token = '' }) {
    const iframeRef = useRef(null);
    const popupRef = useRef(null); // keep track of the login popup
    const lastBlurTime = useRef(0); // track when window lost focus (popup opened)
    const reloadScheduled = useRef(false);

    // Minimal embed URL for guest mode / no-token operation
    const baseUrl = 'https://chat.crowd1.com/embed';
    const params = new URLSearchParams({
        selected_project: selectedProject,
        show_login_button: 'true'
    });
    if (token) params.append('token', token);
    const embedUrl = `${baseUrl}?${params.toString()}`;

    // Force reload the iframe to pick up new auth state
    const reloadIframe = useCallback(() => {
        if (iframeRef.current && !reloadScheduled.current) {
            reloadScheduled.current = true;
            console.log('🔄 [C1Chatbot] Reloading iframe to sync auth state...');
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => {
                if (iframeRef.current) {
                    iframeRef.current.src = currentSrc;
                }
                reloadScheduled.current = false;
            }, 150);
        }
    }, []);

    useEffect(() => {
        // Track when window loses focus (likely popup opened)
        const handleBlur = () => {
            lastBlurTime.current = Date.now();
            console.log('👁️ [C1Chatbot] Window lost focus (popup may have opened)');
        };

        // When window regains focus after blur, reload iframe to catch auth changes
        const handleFocus = () => {
            const blurDuration = Date.now() - lastBlurTime.current;
            // Only reload if we were blurred for more than 2 seconds (user was in popup)
            if (lastBlurTime.current > 0 && blurDuration > 2000) {
                console.log(`👁️ [C1Chatbot] Window regained focus after ${Math.round(blurDuration/1000)}s - reloading iframe`);
                // Small delay to let auth-redirect finish storing tokens
                setTimeout(reloadIframe, 500);
            }
            lastBlurTime.current = 0;
        };

        // Listen for storage events (embed may use localStorage for auth sync)
        const handleStorage = (event) => {
            if (event.key?.includes('c1') || event.key?.includes('auth') || event.key?.includes('crowd1')) {
                console.log('💾 [C1Chatbot] Storage changed, reloading iframe:', event.key);
                setTimeout(reloadIframe, 300);
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('storage', handleStorage);
        };
    }, [reloadIframe]);

    useEffect(() => {
        const handleMessage = (event) => {
            // Accept messages only from chat.crowd1.com
            if (event.origin !== 'https://chat.crowd1.com') return;

            const data = event.data || {};
            const { type, loginUrl } = data;
            console.log(`📬 [C1Chatbot] Received postMessage: ${type}`, data);

            switch (type) {
                case 'IFRAME_READY':
                    console.log('✨ [C1Chatbot] Iframe ready');
                    break;

                case 'REQUEST_AUTH':
                    console.log('🔐 [C1Chatbot] Iframe requested auth status');
                    // Note: localhost may be rejected by iframe's origin check, but we try anyway
                    if (event.source) {
                        event.source.postMessage({
                            type: 'C1_AUTH_RESPONSE',
                            isAuthenticated: !!token,
                            user: null
                        }, event.origin);
                    }
                    break;

                case 'SSO_LOGIN':
                    // Iframe asks parent to open a popup for login
                    if (loginUrl) {
                        console.log('🚀 [C1Chatbot] Opening login popup:', loginUrl);
                        popupRef.current = window.open(loginUrl, 'C1AuthPopup', 'width=600,height=700');
                        if (!popupRef.current) {
                            console.error('❌ Popup blocked! Allow popups for this site.');
                        } else {
                            // Poll for popup close - if it closes without postMessage, reload iframe
                            const pollInterval = setInterval(() => {
                                if (popupRef.current?.closed) {
                                    clearInterval(pollInterval);
                                    console.log('🔁 [C1Chatbot] Popup closed - reloading iframe to sync auth state');
                                    popupRef.current = null;
                                    reloadIframe();
                                }
                            }, 500);
                        }
                    }
                    break;

                case 'C1_AUTH_SUCCESS':
                    console.log('✅ [C1Chatbot] Auth success received from popup/iframe');
                    // Close the popup if still open
                    if (popupRef.current && !popupRef.current.closed) {
                        popupRef.current.close();
                        console.log('🔒 [C1Chatbot] Popup closed');
                    }
                    popupRef.current = null;
                    // Forward to iframe so it updates its logged-in state
                    if (iframeRef.current?.contentWindow) {
                        console.log('➡️ [C1Chatbot] Forwarding auth success to iframe');
                        iframeRef.current.contentWindow.postMessage(data, 'https://chat.crowd1.com');
                    }
                    break;

                case 'AUTH_COMPLETE':
                case 'LOGIN_SUCCESS':
                    // Alternative message types some versions of the embed might send
                    console.log('✅ [C1Chatbot] Alternative auth success:', type);
                    if (popupRef.current && !popupRef.current.closed) {
                        popupRef.current.close();
                    }
                    popupRef.current = null;
                    reloadIframe();
                    break;

                case 'C1_AUTH_ERROR':
                    console.error('❌ [C1Chatbot] Auth error:', data.message);
                    if (popupRef.current && !popupRef.current.closed) {
                        popupRef.current.close();
                    }
                    popupRef.current = null;
                    break;

                default:
                    // Other messages (analytics, events, etc.)
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [token, reloadIframe]);

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
