import { useState } from 'react'
import C1Chatbot from './components/C1Chatbot'

function App() {
    const [token, setToken] = useState('');

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

                    <div style={{
                        marginTop: '3rem',
                        opacity: 0.6,
                        transition: 'opacity 0.3s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    >
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            Pro Tip: Paste an SSO Token (JWT) here to test instant login:
                        </p>
                        <input
                            type="text"
                            placeholder="SSO Token (Optional)"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                width: '100%',
                                maxWidth: '400px',
                                fontSize: '0.8rem'
                            }}
                        />
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>C1 Demo • Powered by Crowd1</p>
            </footer>

            {/* C1 Chatbot Integration */}
            <C1Chatbot selectedProject="combined_c1_all" token={token} />
        </div>
    )
}

export default App
