/**
 * AuthService.js (Production Blueprint)
 * 
 * In a real-world application, this service would make requests to YOUR OWN backend.
 * Your backend would then securely call the C1 API using your SECRET API KEY.
 * 
 * NEVER put your C1 Secret API Key in the frontend code.
 */

class AuthService {
    /**
     * Simulates a login flow on your parent site.
     * In production, this would be your actual login logic.
     */
    async login(username, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock successful user data from your database
        const user = {
            id: 'user_123',
            username: username || 'test_user',
            email: 'user@example.com'
        };

        // Simulate fetching a C1 SSO Token from your backend
        // In production, your backend would call: https://chat-api.crowd1.com/api/v1/crowd1/access
        const c1Token = await this.fetchC1Token(user.id);

        return { user, c1Token };
    }

    /**
     * REAL WORLD BLUEPRINT:
     * This function represents where you would call your own API.
     * 
     * Example:
     * const response = await fetch('/api/get-c1-token');
     * const { token } = await response.json();
     * return token;
     */
    async fetchC1Token(userId) {
        // For this demo, we return an empty string or a placeholder.
        // To see the chatbot log in, you can paste a real JWT here from the C1 Simulator.
        console.log(`[Backend Simulation] Generating C1 Token for user ${userId}...`);
        return "";
    }

    logout() {
        // Perform local logout logic
        console.log('[AuthService] User logged out.');
    }
}

export default new AuthService();
