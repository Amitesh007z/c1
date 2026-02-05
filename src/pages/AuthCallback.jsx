import { useEffect, useState } from 'react';

/**
 * Auth Callback Page
 * Handles the redirect from Crowd1 SSO login.
 * Extracts tokens from URL and stores them, then redirects to main app.
 */
function AuthCallback() {
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const processAuth = () => {
            try {
                // Get URL parameters - tokens come in various forms
                const params = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
                
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

                console.log('🔐 [AuthCallback] Processing auth redirect...');
                console.log('🔐 [AuthCallback] Token found:', !!token);
                console.log('🔐 [AuthCallback] UID:', uid);

                if (token) {
                    // Store the token in localStorage for the main app to use
                    localStorage.setItem('c1_auth_token', token);
                    if (uid) localStorage.setItem('c1_auth_uid', uid);
                    if (refreshToken) localStorage.setItem('c1_auth_refresh', refreshToken);
                    
                    console.log('✅ [AuthCallback] Token stored successfully');
                    setStatus('success');
                    
                    // Redirect back to main app after a brief moment
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
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
