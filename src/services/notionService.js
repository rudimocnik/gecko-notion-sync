import { Client } from "@notionhq/client";
import { fetchCryptoPrices } from "./cryptoService.js";

// Parse database configurations from environment
const getDatabaseConfigs = () => {
  const notionApiKey = process.env.NOTION_API_KEY;
  
  // Check if we're using the new multi-database format
  if (process.env.NOTION_DATABASES) {
    try {
      return JSON.parse(process.env.NOTION_DATABASES).map(config => ({
        ...config,
        notionApiKey
      }));
    } catch (error) {
      console.error('Error parsing NOTION_DATABASES:', error);
      throw error;
    }
  }
  
  // Fallback to single database configuration
  return [{
    id: process.env.NOTION_DATABASE_ID,
    priceProperty: process.env.NOTION_PRICE_PROPERTY || "Current Price ($)",
    marketCapProperty: process.env.NOTION_MARKET_CAP_PROPERTY || "Market Cap ($)",
    symbolProperty: process.env.NOTION_SYMBOL_PROPERTY || "API ID",
    notionApiKey
  }];
};

// Function to get all tokens from a Notion database
const getTokensFromNotion = async (notion, databaseId, symbolPropertyName) => {
  console.log('Fetching from database:', databaseId);
  console.log('Looking for property:', symbolPropertyName);

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  console.log('Number of results:', response.results.length);
  
  if (response.results.length > 0) {
    console.log('Available properties:', Object.keys(response.results[0].properties));
  }

  const tokens = response.results.map(page => {
    const property = page.properties[symbolPropertyName];
    if (!property) {
      console.error(`Property "${symbolPropertyName}" not found in page`);
      return null;
    }
    
    if (!property.rich_text || !property.rich_text[0]) {
      console.error(`Property "${symbolPropertyName}" has no text content`);
      return null;
    }

    const id = property.rich_text[0].plain_text?.toLowerCase();
    console.log('Found ID:', id);
    return id;
  }).filter(Boolean);

  const uniqueTokens = [...new Set(tokens)];
  console.log('Final tokens list:', uniqueTokens);
  return uniqueTokens;
};

// Function to update a single database
const updateDatabase = async (config) => {
  const notion = new Client({
    auth: config.notionApiKey,
  });

  try {
    const tokens = await getTokensFromNotion(notion, config.id, config.symbolProperty);
    
    if (tokens.length === 0) {
      console.error('No valid tokens found in the database');
      return;
    }

    const prices = await fetchCryptoPrices(tokens);

    for (const [symbol, priceData] of Object.entries(prices)) {
      const price = priceData.usd;
      const marketCap = priceData?.usd_market_cap;

      const response = await notion.databases.query({
        database_id: config.id,
        filter: {
          property: config.symbolProperty,
          rich_text: {
            equals: symbol,
          },
        },
      });

      if (response.results.length === 0) {
        console.log(`No page found for ${symbol} in database ${config.id}`);
        continue;
      }

      for (const page of response.results) {
        await notion.pages.update({
          page_id: page.id,
          properties: {
            [config.priceProperty]: {
              number: parseFloat(price.toFixed(2)),
            },
            [config.marketCapProperty]: {
              number: parseFloat(marketCap.toFixed(2)),
            },
          },
        });
      }
      console.log(`Updated ${response.results.length} row(s) for ${symbol} in database ${config.id}`);
    }
  } catch (error) {
    console.error(`Error updating database ${config.id}:`, error);
    throw error;
  }
};

// Main function to update all databases
export const updateCryptoPrices = async () => {
  const databaseConfigs = getDatabaseConfigs();
  
  // Update all databases in parallel
  await Promise.all(databaseConfigs.map(config => updateDatabase(config)));
};