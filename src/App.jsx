import { useState } from 'react'
import C1Chatbot from './components/C1Chatbot'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');

    // Simulate logging into the parent site and getting a C1 token
    const handleLogin = () => {
        // In production, your backend would generate this JWT
        // For this demo, we use a placeholder or the user can paste one
        setIsLoggedIn(true);
        // Note: In a real app, you would fetch this from your API
        const demoToken = ""; // Placeholder for automated flow
        setToken(demoToken);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setToken('');
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">🤖</div>
                        <span>C1 Demo</span>
                    </div>
                    <div className="header-actions">
                        {!isLoggedIn ? (
                            <button className="btn-login" onClick={handleLogin}>
                                Login with C1
                            </button>
                        ) : (
                            <div className="user-profile">
                                <span className="user-name">Welcome, User!</span>
                                <button className="btn-logout" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                <section className="hero-section">
                    <h1 className="hero-title">
                        C1 Chatbot <span>Integration</span>
                    </h1>
                    <p className="hero-description">
                        This demo shows the <strong>Production-Ready SSO Flow</strong>.
                        When you Login above, your site passes a token to the chatbot automatically.
                    </p>

                    <div className="sso-demo-panel">
                        <h3>Automated SSO Status</h3>
                        <div className="status-badge" style={{
                            background: isLoggedIn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isLoggedIn ? '#10B981' : '#EF4444',
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            marginBottom: '1rem'
                        }}>
                            {isLoggedIn ? '● Site Authenticated' : '○ Pending Site Login'}
                        </div>

                        <div className="token-input-wrapper">
                            <label>SSO Token (JWT)</label>
                            <input
                                type="text"
                                placeholder="Paste token here from Simulator..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                            <p className="helper-text">
                                In production, your <strong>Backend</strong> would provide this token automatically when the user logs in.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>C1 Demo • Powered by Crowd1</p>
            </footer>

            {/* C1 Chatbot Integration - Automated via token prop */}
            <C1Chatbot selectedProject="combined_c1_all" token={token} />
        </div>
    )
}

export default App
