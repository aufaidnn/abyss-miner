const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Konfigurasi Kredensial X API v2 (Ganti dengan Token Developer kamu)
const BEARER_TOKEN = process.env.BEARER_TOKEN;
const X_API_BASE_URL = 'https://api.twitter.com/2';

// 1. Endpoint untuk Menarik / Scraping Tweet WTB secara Live (Recent Search)
app.get('/api/scrape-leads', async (req, res) => {
    try {
        // Query: Cari kata wtb/cari/butuh untuk produk netflix/capcut/canva, abaikan retweet
        const searchQuery = "(wtb OR cari OR butuh OR nyari) (netflix OR capcut OR canva OR spotify) -is:retweet";
        
        const response = await axios.get(`${X_API_BASE_URL}/tweets/search/recent`, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`
            },
            params: {
                'query': searchQuery,
                'max_results': 10,
                'tweet.fields': 'author_id,created_at,text,id'
            }
        });

        const tweets = response.data.data || [];
        res.status(200).json({
            success: true,
            message: `Berhasil menarik ${tweets.length} cuitan WTB terbaru!`,
            data: tweets
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.response ? error.response.data : error.message
        });
    }
});

// 2. Endpoint untuk Auto-Reply ke Tweet Pembeli (POST /2/tweets)
app.post('/api/send-reply', async (req, res) => {
    try {
        const { text, in_reply_to_tweet_id } = req.body;

        // Validasi payload
        if (!text || !in_reply_to_tweet_id) {
            return res.status(400).json({ success: false, message: 'Text dan Tweet ID wajib diisi!' });
        }

        // Request ke X API v2 Endpoint Create Tweet (Reply)
        const response = await axios.post(`${X_API_BASE_URL}/tweets`, {
            text: text,
            reply: {
                in_reply_to_tweet_id: in_reply_to_tweet_id
            }
        }, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Balasan otomatis berhasil dikirim ke X!',
            data: response.data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.response ? error.response.data : error.message
        });
    }
});

// Jalankan Server Backend di Port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Abyss Miner Backend] Server jalan di http://localhost:${PORT}`);
});
