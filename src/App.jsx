import { useState, useEffect } from 'react'
import C1Chatbot from './components/C1Chatbot'

// Use our own Netlify function to proxy the Crowd1 API (avoids CORS)
const C1_ACCESS_API = '/.netlify/functions/c1-auth';

function App() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [authToken, setAuthToken] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Check for stored token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('c1_auth_token');
        if (storedToken) {
            console.log('✅ [App] Found stored auth token');
            setAuthToken(storedToken);
        }
    }, []);

    // Force refresh the chatbot iframe
    const handleRefreshChatbot = () => {
        console.log('🔄 [App] Manually refreshing chatbot...');
        setRefreshKey(k => k + 1);
    };

    // Logout - clear stored token
    const handleLogout = () => {
        console.log('🚪 [App] Logging out...');
        localStorage.removeItem('c1_auth_token');
        localStorage.removeItem('c1_auth_uid');
        localStorage.removeItem('c1_auth_refresh');
        setAuthToken(null);
        setRefreshKey(k => k + 1);
    };

    // Login flow using Crowd1 API
    const handleLogin = async () => {
        setIsLoggingIn(true);
        console.log('🔐 [App] Starting login flow...');

        try {
            // Call Crowd1 API with OUR domain as redirect_url
            const redirectUrl = `${window.location.origin}/auth-callback`;
            console.log('🔗 [App] Redirect URL:', redirectUrl);

            const response = await fetch(C1_ACCESS_API, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    redirect_url: redirectUrl
                })
            });

            const data = await response.json();
            console.log('📥 [App] API Response:', data);

            if (data.success && data.login_url) {
                // Redirect to Crowd1 login page
                console.log('🚀 [App] Redirecting to login...');
                window.location.href = data.login_url;
            } else {
                console.error('❌ [App] Failed to get login URL:', data);
                alert('Failed to initiate login. Please try again.');
                setIsLoggingIn(false);
            }
        } catch (error) {
            console.error('❌ [App] Login error:', error);
            alert('Login failed. Please try again.');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">🤖</div>
                        <span>C1 Demo</span>
                    </div>
                    {authToken && (
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </header>

            <main className="main-content">
                <section className="hero-section">
                    <h1 className="hero-title">
                        C1 Chatbot <span>Integration</span>
                    </h1>
                    <p className="hero-description">
                        Simple demonstration of the Crowd1 Chatbot iframe.
                        The chatbot bubble should appear in the bottom-right corner.
                    </p>

                    <div className="sso-test-section" style={{
                        marginTop: '3rem',
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        margin: '3rem auto 0'
                    }}>
                        {authToken ? (
                            <>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    color: '#10B981'
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                                    <span style={{ fontWeight: '600' }}>Logged in with Crowd1</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                    You can now use all chatbot features including ticket creation.
                                </p>
                                <button
                                    onClick={handleRefreshChatbot}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--gradient-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    🔄 Refresh Chatbot
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                    Login to access all features including ticket creation.
                                </p>
                                <button
                                    onClick={handleLogin}
                                    disabled={isLoggingIn}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: isLoggingIn ? '#666' : 'var(--gradient-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {isLoggingIn ? '⏳ Connecting...' : '🔐 Login with Crowd1'}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                                    Guest chat is available without login.
                                </p>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>C1 Demo • Powered by Crowd1</p>
            </footer>

            {/* C1 Chatbot - Pass the token if we have one */}
            <C1Chatbot key={refreshKey} selectedProject="combined_c1" token={authToken || ''} />
        </div>
    )
}

export default App
