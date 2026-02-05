import { useEffect, useState } from 'react';

/**
 * Auth Callback Page
 * Handles the redirect from Crowd1 SSO login.
 * Extracts tokens from URL and stores them, then redirects to main app.
 */

// Helper to decode JWT payload (base64)
function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
    }
}

function AuthCallback() {
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        const processAuth = () => {
            try {
                // Get URL parameters - tokens come in various forms
                const params = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
                
                // Log all params for debugging
                console.log('🔐 [AuthCallback] URL search:', window.location.search);
                console.log('🔐 [AuthCallback] URL hash:', window.location.hash);
                console.log('🔐 [AuthCallback] All params:', Object.fromEntries(params.entries()));
                console.log('🔐 [AuthCallback] All hash params:', Object.fromEntries(hashParams.entries()));
                
                // Try to extract token from various parameter names
                const token = 
                    params.get('id_token') || 
                    params.get('access_token') || 
                    params.get('token') ||
                    hashParams.get('id_token') ||
                    hashParams.get('access_token') ||
                    hashParams.get('token');

                const uid = params.get('uid') || hashParams.get('uid');
                const refreshToken = params.get('refresh_token') || hashParams.get('refresh_token');
                const email = params.get('email') || hashParams.get('email');
                const name = params.get('name') || hashParams.get('name');

                console.log('🔐 [AuthCallback] Processing auth redirect...');
                console.log('🔐 [AuthCallback] Token found:', !!token);
                console.log('🔐 [AuthCallback] Token preview:', token ? token.substring(0, 50) + '...' : 'none');
                console.log('🔐 [AuthCallback] UID:', uid);
                console.log('🔐 [AuthCallback] Email from URL:', email);

                // Try to decode JWT to get user info
                let jwtPayload = null;
                if (token) {
                    jwtPayload = decodeJwtPayload(token);
                    console.log('🔐 [AuthCallback] JWT Payload:', jwtPayload);
                }

                // Store debug info for display
                setDebugInfo({
                    tokenFound: !!token,
                    tokenType: token?.split('.').length === 3 ? 'JWT' : 'opaque',
                    uid,
                    email: email || jwtPayload?.email,
                    name: name || jwtPayload?.name,
                    jwtPayload
                });

                if (token) {
                    // Store the token in localStorage for the main app to use
                    localStorage.setItem('c1_auth_token', token);
                    if (uid) localStorage.setItem('c1_auth_uid', uid);
                    if (refreshToken) localStorage.setItem('c1_auth_refresh', refreshToken);
                    
                    // Store user info if available
                    const userEmail = email || jwtPayload?.email;
                    const userName = name || jwtPayload?.name;
                    if (userEmail) localStorage.setItem('c1_auth_email', userEmail);
                    if (userName) localStorage.setItem('c1_auth_name', userName);
                    
                    console.log('✅ [AuthCallback] Token stored successfully');
                    console.log('✅ [AuthCallback] User email:', userEmail || 'NOT FOUND');
                    setStatus('success');
                    
                    // Redirect back to main app after a brief moment
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    console.error('❌ [AuthCallback] No token found in URL');
                    setStatus('error');
                    setError('No authentication token received. Please try again.');
                }
            } catch (err) {
                console.error('❌ [AuthCallback] Error processing auth:', err);
                setStatus('error');
                setError(err.message);
            }
        };

        processAuth();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0F172A',
            color: '#F1F5F9',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                maxWidth: '400px'
            }}>
                {status === 'processing' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Processing Login...</h2>
                        <p style={{ color: '#94A3B8' }}>Please wait while we complete your authentication.</p>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ marginBottom: '0.5rem', color: '#10B981' }}>Login Successful!</h2>
                        <p style={{ color: '#94A3B8' }}>Redirecting you back to the chatbot...</p>
                        {debugInfo && (
                            <div style={{ 
                                marginTop: '1rem', 
                                padding: '1rem', 
                                background: 'rgba(0,0,0,0.3)', 
                                borderRadius: '8px',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                color: '#94A3B8'
                            }}>
                                <div><strong>Email:</strong> {debugInfo.email || '❌ Not found'}</div>
                                <div><strong>Name:</strong> {debugInfo.name || '❌ Not found'}</div>
                                <div><strong>Token:</strong> {debugInfo.tokenType}</div>
                            </div>
                        )}
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                        <h2 style={{ marginBottom: '0.5rem', color: '#EF4444' }}>Login Failed</h2>
                        <p style={{ color: '#94A3B8', marginBottom: '1rem' }}>{error}</p>
                        <a 
                            href="/"
                            style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}
                        >
                            Back to Home
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default AuthCallback;
