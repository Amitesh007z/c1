import React from 'react';

function C1Chatbot({ selectedProject = 'combined_c1_all', token = '' }) {
    // Build the embed URL with optional token for Approach A SSO
    const baseUrl = 'https://chat.crowd1.com/embed';
    const params = new URLSearchParams({
        selected_project: selectedProject,
        show_login_button: 'true'
    });

    if (token) {
        params.append('token', token);
    }

    const embedUrl = `${baseUrl}?${params.toString()}`;

    return (
        <div className="c1-chatbot-container">
            <iframe
                id="c1-chatbot-iframe"
                src={embedUrl}
                title="C1 Chatbot"
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation"
            // Removed sandbox as it can interfere with popup-to-iframe communication during auth
            />
        </div>
    );
}

export default C1Chatbot;
