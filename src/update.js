import dotenv from "dotenv";
import { updateCryptoPrices } from "./services/notionService.js";

dotenv.config();

// Run the update
console.log('Starting price update...');
updateCryptoPrices()
  .then(() => {
    console.log('Price update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error updating prices:', error);
    process.exit(1);
  }); 