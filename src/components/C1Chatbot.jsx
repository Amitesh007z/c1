import React from 'react';

function C1Chatbot({ selectedProject = 'combined_c1_all' }) {
    // Build the embed URL
    const embedUrl = `https://chat.crowd1.com/embed?selected_project=${selectedProject}&show_login_button=true`;

    return (
        <div className="c1-chatbot-container">
            <iframe
                id="c1-chatbot-iframe"
                src={embedUrl}
                title="C1 Chatbot"
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation; identity-credentials-get; publickey-credentials-get"
            // Ensure no sandbox is present as it can block internal redirects and popups
            />
        </div>
    );
}

export default C1Chatbot;
