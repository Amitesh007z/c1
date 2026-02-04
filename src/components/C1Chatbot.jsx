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
    const hasLoggedOriginInfo = useRef(false);

    // Clean the token
    const cleanToken = token ? token.split('&')[0].split('?token=')[1] || token.split('&')[0] : '';

    const baseUrl = 'https://chat.crowd1.com/embed';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const params = new URLSearchParams({
        selected_project: selectedProject,
        show_login_button: 'true',
        origin: origin,
        parent_url: origin,
        allowed_origin: origin,
        partner_origin: origin
    });
    
    if (cleanToken) params.append('token', cleanToken);
    const embedUrl = `${baseUrl}?${params.toString()}`;

    // Log origin info once on mount for debugging
    useEffect(() => {
        if (!hasLoggedOriginInfo.current) {
            hasLoggedOriginInfo.current = true;
            console.log('\n');
            console.log('%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5; font-weight: bold;');
            console.log('%c   C1 CHATBOT EMBED - INTEGRATION DEBUG INFO', 'color: #4F46E5; font-size: 14px; font-weight: bold;');
            console.log('%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5; font-weight: bold;');
            console.log('%c Parent Origin: %c' + origin, 'color: #888;', 'color: #10B981; font-weight: bold;');
            console.log('%c Embed URL:     %c' + baseUrl, 'color: #888;', 'color: #3B82F6;');
            console.log('%c Project:       %c' + selectedProject, 'color: #888;', 'color: #F59E0B;');
            console.log('%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5; font-weight: bold;');
            console.log('\n');
        }
    }, [origin, selectedProject]);

    const reloadIframe = useCallback(() => {
        if (iframeRef.current && !reloadScheduled.current) {
            reloadScheduled.current = true;
            console.log('%c[C1Chatbot] Reloading iframe to sync auth state...', 'color: #3B82F6;');
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
            if (lastBlurTime.current > 0 && blurDuration > 3000) {
                console.log('%c[C1Chatbot] Tab regained focus after ' + Math.round(blurDuration/1000) + 's - refreshing', 'color: #8B5CF6;');
                setTimeout(reloadIframe, 1000);
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
            const potentialToken = data.token || data.id_token || data.payload?.token;

            // Minimal logging for routine messages
            if (type === 'IFRAME_READY') {
                console.log('%c✓ [C1Chatbot] Iframe connected', 'color: #10B981;');
                return;
            }

            if (type === 'REQUEST_AUTH') {
                console.log('%c→ [C1Chatbot] Sending auth response to iframe...', 'color: #3B82F6;');
                event.source?.postMessage({
                    type: 'C1_AUTH_RESPONSE',
                    isAuthenticated: !!cleanToken,
                    token: cleanToken
                }, event.origin);
                
                // This is where the problem shows up - log it clearly
                console.log('\n');
                console.log('%c⚠️  IMPORTANT: Watch for "untrusted origin" error below ⚠️', 'color: #F59E0B; font-size: 12px; font-weight: bold;');
                console.log('%c   If you see: "🚫 Message from untrusted origin: ' + origin + '"', 'color: #EF4444;');
                console.log('%c   This means Crowd1 embed is REJECTING messages from your domain.', 'color: #EF4444;');
                console.log('\n');
                return;
            }

            switch (type) {
                case 'SSO_LOGIN':
                    if (loginUrl) {
                        console.log('%c→ [C1Chatbot] Opening login popup...', 'color: #8B5CF6;');
                        popupRef.current = window.open(loginUrl, 'C1AuthPopup', 'width=600,height=800');
                    }
                    break;

                case 'C1_AUTH_SUCCESS':
                case 'AUTH_SUCCESS':
                case 'LOGIN_SUCCESS':
                    console.log('%c✓ [C1Chatbot] Auth Success!', 'color: #10B981; font-weight: bold;');
                    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
                    reloadIframe();
                    break;

                default:
                    if (potentialToken) {
                        console.log('%c✓ [C1Chatbot] Token detected, reloading...', 'color: #10B981;');
                        reloadIframe();
                    }
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [cleanToken, reloadIframe, origin]);

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
