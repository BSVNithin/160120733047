const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/numbers', async (req, res) => {
    const urls = req.query.url;

    if (!urls) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    const uniqueNumbers = new Set();

    const urlPromises = urls.map(async (url) => {
        try {
            const response = await axios.get(url, { timeout: 500 });
            if (response.status === 200) {
                const data = response.data;
                data.numbers.forEach((num) => uniqueNumbers.add(num));
            }
        } catch (error) {
            
        }
    });

    try {
        await Promise.all(urlPromises);
        const sortedNumbers = Array.from(uniqueNumbers).sort((a, b) => a - b);
        res.json({ numbers: sortedNumbers });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`Number Management Service listening at http://localhost:${port}`);
});
