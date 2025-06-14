# CoinGecko to Notion Price Tracker

A Node.js application that automatically fetches cryptocurrency prices from CoinGecko and updates them in one or more Notion databases. The app can run in two modes: as a server with automatic updates or as a one-time update script.

## Features

- Fetches real-time cryptocurrency prices from CoinGecko's free API
- Updates prices and market cap in your Notion database(s)
- Support for multiple Notion databases
- Two running modes:
  - Server mode with automatic updates every 5 minutes
  - One-time update mode
- Rate limiting to respect CoinGecko's free API limits
- Simple shell script for easy execution

## Prerequisites

- Node.js (v14 or higher)
- A Notion account
- A Notion integration (API key)
- One or more Notion databases with the required properties

## Setup

1. Clone the repository:
```bash
git clone https://github.com/rudimocnik/gecko-notion-sync.git
cd gecko-notion-sync
```

2. Install dependencies:
```bash
npm install
```

3. Make the run script executable:
```bash
chmod +x run.sh
```

4. Create a `.env` file in the root directory with the following variables:

For a single database:
```env
NOTION_API_KEY=your_notion_integration_key
NOTION_DATABASE_ID=your_notion_database_id
NOTION_PRICE_PROPERTY="Current Price ($)"
NOTION_MARKET_CAP_PROPERTY="Market Cap ($)"
NOTION_SYMBOL_PROPERTY="API ID"
PORT=3000
```

For multiple databases:
```env
NOTION_API_KEY=your_notion_integration_key
NOTION_DATABASES='[
  {
    "id": "database_id_1",
    "priceProperty": "Current Price ($)",
    "marketCapProperty": "Market Cap ($)",
    "symbolProperty": "API ID"
  },
  {
    "id": "database_id_2",
    "priceProperty": "Price",
    "marketCapProperty": "Market Cap",
    "symbolProperty": "Coin ID"
  }
]'
PORT=3000
```

## Notion Database Setup

1. Create one or more databases in Notion
2. For each database, add the following properties:
   - A text property for the CoinGecko API ID (e.g., "API ID" or "Coin ID")
   - A number property for the current price
   - A number property for the market cap

3. Share your databases with your Notion integration:
   - Go to each database
   - Click "Share" in the top right
   - Add your integration

## Running the Application

### Using the Run Script

The application can be run in two modes using the provided shell script:

1. Server Mode (with automatic updates every 5 minutes):
```bash
./run.sh server
```

2. One-time Update Mode:
```bash
./run.sh update
```

### Running in Background

To run the server in the background (useful for long-term operation):

```bash
nohup ./run.sh server > coingecko-notion.log 2>&1 &
```

To check if the server is running:
```bash
ps aux | grep "node src/server.js"
```

To stop the server:
```bash
pkill -f "node src/server.js"
```

### Manual API Endpoints (Server Mode Only)

When running in server mode, the following endpoint is available:
- `GET /` - Trigger a manual update of all cryptocurrency prices

## CoinGecko API IDs

Use the exact IDs from CoinGecko's API. You can find the complete list at:
```
https://api.coingecko.com/api/v3/coins/list
```

Example IDs:
- "bitcoin" for Bitcoin
- "ethereum" for Ethereum
- "solana" for Solana
- "virtual-protocol" for Virtuals Protocol

## Rate Limiting

The application includes rate limiting to respect CoinGecko's free API limits:
- 10-50 calls per minute
- 1-second delay between requests
- Automatic retry with 60-second delay if rate limit is hit

## Error Handling

The application includes comprehensive error handling and logging for:
- API rate limits
- Invalid property names
- Missing database entries
- Network errors

## Contributing

Feel free to submit issues and enhancement requests!