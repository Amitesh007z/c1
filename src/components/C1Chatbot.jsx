import React from 'react';

function C1Chatbot({ selectedProject = 'combined_c1_all' }) {
    // Build the embed URL with origin/parent_url to help with redirect authorization
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const embedUrl = `https://chat.crowd1.com/embed?selected_project=${selectedProject}&show_login_button=true&origin=${encodeURIComponent(origin)}&parent_url=${encodeURIComponent(origin)}`;

    return (
        <div className="c1-chatbot-container">
            <iframe
                id="c1-chatbot-iframe"
                src={embedUrl}
                title="C1 Chatbot"
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation; identity-credentials-get; publickey-credentials-get"
            // Important: No sandbox, and no extra restrictions
            />
        </div>
    );
}

export default C1Chatbot;
