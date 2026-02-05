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

                    <div className="auth-section" style={{
                        marginTop: '3rem',
                        padding: '2rem',
                        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                        borderRadius: '16px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        margin: '3rem auto 0',
                        border: '1px solid rgba(79, 70, 229, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}>
                        {authToken ? (
                            <>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{ 
                                        fontSize: '2.5rem',
                                        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))'
                                    }}>✅</span>
                                </div>
                                <h3 style={{ 
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: '#10B981',
                                    marginBottom: '0.5rem'
                                }}>You're Logged In!</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    All chatbot features are now available.
                                </p>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <span style={{ 
                                        fontSize: '3rem',
                                        display: 'block',
                                        marginBottom: '0.5rem'
                                    }}>🔐</span>
                                    <h3 style={{ 
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        color: 'var(--color-text)',
                                        marginBottom: '0.5rem'
                                    }}>Unlock Full Features</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        Login to create tickets and access all features.
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogin}
                                    disabled={isLoggingIn}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '1rem 1.5rem',
                                        background: isLoggingIn 
                                            ? 'rgba(100, 100, 100, 0.5)' 
                                            : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                                        fontWeight: '700',
                                        fontSize: '1.1rem',
                                        boxShadow: isLoggingIn ? 'none' : '0 4px 20px rgba(79, 70, 229, 0.4)',
                                        transition: 'all 0.3s ease',
                                        transform: isLoggingIn ? 'none' : 'translateY(0)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoggingIn) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 24px rgba(79, 70, 229, 0.5)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.4)';
                                    }}
                                >
                                    {isLoggingIn ? (
                                        <>
                                            <span style={{ 
                                                animation: 'spin 1s linear infinite',
                                                display: 'inline-block'
                                            }}>⏳</span>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>Login with Crowd1</>
                                    )}
                                </button>
                                <p style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--color-text-muted)', 
                                    marginTop: '1.25rem',
                                    opacity: 0.7
                                }}>
                                    💬 Guest chat available without login
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
