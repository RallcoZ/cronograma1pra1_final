// api/clickup.js
export default async function handler(req, res) {
    console.log("--- [START] /api/clickup function triggered ---");
    console.log("Request Method:", req.method);

    if (req.method !== 'POST') {
        console.error("Error: Method not allowed. Must be POST.");
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN;
    console.log("Is ClickUp Token Loaded:", !!CLICKUP_API_TOKEN); // Mostra true se a chave foi carregada

    if (!CLICKUP_API_TOKEN) {
        console.error("CRITICAL: ClickUp API token not found on server environment variables.");
        return res.status(500).json({ error: 'ClickUp API token not configured on server.' });
    }

    const { endpoint, body, method } = req.body;
    console.log("Received request to fetch ClickUp endpoint:", endpoint);

    if (!endpoint) {
        console.error("Error: Endpoint is required in the request body.");
        return res.status(400).json({ error: 'Endpoint is required.' });
    }

    const url = `https://api.clickup.com/api/v2/${endpoint}`;
    const options = {
        method: method || 'GET',
        headers: {
            'Authorization': CLICKUP_API_TOKEN,
            'Content-Type': 'application/json',
        },
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    try {
        console.log(`Attempting to fetch from ClickUp URL: ${url}`);
        const clickupResponse = await fetch(url, options);
        
        // Importante: Verificar se a resposta é JSON antes de tentar converter
        const contentType = clickupResponse.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await clickupResponse.json();
            console.log("Successfully received JSON response from ClickUp.");
            
            if (!clickupResponse.ok) {
                console.error("ClickUp API returned an error:", data);
            }
            
            res.status(clickupResponse.status).json(data);
        } else {
            const textData = await clickupResponse.text();
            console.error("CRITICAL: Received a non-JSON response from ClickUp:", textData);
            res.status(500).json({ error: "Received a non-JSON response from ClickUp API.", details: textData });
        }

    } catch (error) {
        console.error("--- [CRITICAL ERROR] Function failed inside the try-catch block ---", error);
        res.status(500).json({ error: 'The server function failed unexpectedly.', details: error.message });
    }
}