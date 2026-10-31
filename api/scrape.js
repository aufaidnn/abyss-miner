const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Mengizinkan akses CORS dari frontend GitHub Pages kamu
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const bearerToken = process.env.X_BEARER_TOKEN;
        if (!bearerToken) {
            return res.status(500).json({ error: 'Bearer Token belum dikonfigurasi di server backend.' });
        }

        // Query pencarian WTB / Joki
        const queryParam = encodeURIComponent('wtb (netflix | canva | capcut | joki) -is:retweet');
        const targetUrl = `https://api.twitter.com/2/tweets/search/recent?query=${queryParam}&max_results=10&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username,name`;

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.detail || 'Gagal terhubung ke X API v2.',
                details: data 
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};