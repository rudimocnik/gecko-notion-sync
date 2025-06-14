import axios from "axios";

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCryptoPrices = async (tokens) => {
  const BASE_URL = "https://api.coingecko.com/api/v3";
  
  // Free API endpoint
  const url = `${BASE_URL}/simple/price`;

  const params = {
    ids: tokens.join(","),
    vs_currencies: "usd",
    include_market_cap: true,
  };

  try {
    // Add a small delay to respect rate limits (free tier: 10-50 calls/minute)
    await delay(1000);
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Waiting before retry...");
      // Wait for 60 seconds before retrying if we hit rate limit
      await delay(60000);
      return fetchCryptoPrices(tokens);
    }
    console.error("Error fetching data from CoinGecko:", error);
    throw error;
  }
};