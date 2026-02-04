import { useState } from 'react'
import C1Chatbot from './components/C1Chatbot'

function App() {
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh the chatbot iframe
    const handleRefreshChatbot = () => {
        console.log('🔄 [App] Manually refreshing chatbot...');
        setRefreshKey(k => k + 1);
    };

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
                        textAlign: 'center',
                        maxWidth: '500px',
                        margin: '3rem auto 0'
                    }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            After logging in via popup, click below to sync the chatbot.
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
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>C1 Demo • Powered by Crowd1</p>
            </footer>

            {/* C1 Chatbot - Production Bridge. Key forces remount on refresh */}
            <C1Chatbot key={refreshKey} selectedProject="combined_c1_all" />
        </div>
    )
}

export default App
