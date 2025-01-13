const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;  // Użycie portu, który jest przypisany przez Render

// Cache storage
const cache = {
  wager: { data: null, lastFetched: null },
};

// Utility function to check cache validity
function isCacheValid(lastFetched) {
  if (!lastFetched) return false;
  const TEN_MINUTES = 10 * 60 * 1000;
  return Date.now() - lastFetched < TEN_MINUTES;
}

// Function to fetch data from Skinsbag API
async function fetchData(endpoint, cacheKey) {
  if (isCacheValid(cache[cacheKey].lastFetched)) {
    return cache[cacheKey].data;
  }

  try {
    const response = await axios.get(`http://skinsbag.gg/api/affiliate-data/${endpoint}`, {
      headers: { 'x-api-key': '7XERMiLDEouAkb4JkB44dPs0/BhXOJuR4wdFsfcBGhw=' },
      params: {
        startsAt: '2025-01-12',
        endsAt: '2025-01-20'
      }
    });

    // Log response data for debugging
    console.log("API Response:", response.data);

    // Update cache
    cache[cacheKey].data = response.data;
    cache[cacheKey].lastFetched = Date.now();
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey} data:`, error.message);
    throw error;
  }
}

// API endpoint to get wager data
app.get('/wager', async (req, res) => {
  try {
    const data = await fetchData('leaderboard/wager', 'wager');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wager data' });
  }
});

// Serve the UI
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
