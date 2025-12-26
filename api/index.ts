import "dotenv/config";
import { app } from "../dist/server.js";

console.log("Vercel Serverless Function initialized");

// Export the Express app as a Vercel serverless function
export default app;
