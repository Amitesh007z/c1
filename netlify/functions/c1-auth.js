// Netlify serverless function to proxy Crowd1 API calls
// This avoids CORS issues since the request comes from the server, not the browser

export default async (request, context) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { redirect_url } = body;

        if (!redirect_url) {
            return new Response(JSON.stringify({ error: 'redirect_url is required' }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        console.log('[C1 Proxy] Calling Crowd1 API with redirect_url:', redirect_url);

        // Call the Crowd1 API from the server (no CORS issues)
        const response = await fetch('https://chat-api.crowd1.com/api/v1/crowd1/access', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ redirect_url }),
        });

        const data = await response.json();
        console.log('[C1 Proxy] Crowd1 API response:', data.success ? 'success' : 'failed');

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('[C1 Proxy] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
};
