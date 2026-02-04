import { useState } from 'react'
import C1Chatbot from './components/C1Chatbot'

function App() {
    const [testToken, setTestToken] = useState('');

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">🤖</div>
                        <span>C1 Demo</span>
                    </div>
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
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '3rem auto 0'
                    }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                            🛠️ SSO Integration Test (Approach A)
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Paste a C1 SSO token below to test automatic login without popups.
                        </p>
                        <input
                            type="text"
                            placeholder="Enter C1 Access Token..."
                            value={testToken}
                            onChange={(e) => setTestToken(e.target.value)}
                            className="token-display"
                            style={{ color: 'var(--color-text)' }}
                        />
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>C1 Demo • Powered by Crowd1</p>
            </footer>

            {/* C1 Chatbot - Production Bridge */}
            <C1Chatbot selectedProject="combined_c1_all" token={testToken} />
        </div>
    )
}

export default App
