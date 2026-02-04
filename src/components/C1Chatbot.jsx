/**
 * C1 Chatbot Component
 * 
 * Embeds the C1 Chatbot iframe - exactly as specified in the documentation.
 * The chatbot appears as a bubble in the bottom-right corner.
 * 
 * Features:
 * - Guest Mode: Users can chat without logging in
 * - Token Auth: Pass token prop for automatic SSO authentication
 * - Ticket Creation: Login only required for creating tickets
 */
function C1Chatbot({ selectedProject = 'combined_c1_all' }) {
    // Build the embed URL exactly as shown in the config tool
    const embedUrl = `https://chat.crowd1.com/embed?selected_project=${selectedProject}&show_login_button=true`;

    return (
        <div className="c1-chatbot-container">
            <iframe
                id="c1-chatbot-iframe"
                src={embedUrl}
                title="C1 Chatbot"
                allow="microphone; camera; clipboard-write; storage-access; focus-without-user-activation"
            />
        </div>
    );
}

export default C1Chatbot;
