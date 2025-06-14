import express from "express";
import dotenv from "dotenv";
import cron from 'node-cron';
import { updateCryptoPrices } from "./services/notionService.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Manual update endpoint
app.get("/", async (req, res) => {
  try {
    await updateCryptoPrices();
    res.status(200).json({ message: "Portfolio updated successfully" });
  } catch (error) {
    console.error("Error updating crypto prices:", error);
    res.status(500).send("Error updating crypto prices.");
  }
});

// Schedule the task to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await updateCryptoPrices();
  } catch (error) {
    console.error('Error during scheduled update:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Automatic updates will run every 5 minutes');
}); 