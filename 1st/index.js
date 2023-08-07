const express = require('express');
const axios = require('axios');
const { DateTime } = require('luxon');

const app = express();

// Configuration
const API_BASE_URL = 'http://20.244.56.144/train';
const CLIENT_ID = 'b46118f0-fbde-4b16-a4b1-6ae6ad718b27';
const CLIENT_SECRET = 'XOyol0RPasKWODAN';

let accessToken = 'dxwKw';

const getAccessToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token`, {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    accessToken = response.data.access_token;
  } catch (error) {
    console.error('Error obtaining access token:', error.message);
  }
};

// Call getAccessToken initially and then refresh it every hour
getAccessToken();
setInterval(getAccessToken, 3600 * 1000);

const getTrains = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trains`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const currentDateTime = DateTime.local();

    // Process and filter train data
    const filteredTrains = response.data.filter((train) => {
      const departureTime = DateTime.fromISO(train.departure_time);
      return departureTime.diff(currentDateTime, 'minutes').minutes > 30;
    });

    // Sort filtered trains
    const sortedTrains = filteredTrains.sort((a, b) => {
      const priceComparison = a.price - b.price;
      if (priceComparison !== 0) return priceComparison;

      const ticketsComparison = b.tickets - a.tickets;
      if (ticketsComparison !== 0) return ticketsComparison;

      return DateTime.fromISO(b.departure_time).diff(DateTime.fromISO(a.departure_time)).milliseconds;
    });

    return sortedTrains;
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    return [];
  }
};

app.get('/trains', async (req, res) => {
  try {
    const trains = await getTrains();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
