import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import snippetRoutes from './routes/snippetRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004; // Use 5001 to avoid conflicts with React's 5173

// --- Middleware ---
// Enable CORS for all routes
app.use(cors()); 
// Allow the server to parse JSON in request bodies
app.use(express.json()); 

// --- MongoDB Connection ---
// Use an async function to connect
const connectDB = async () => {
  try {
    // process.env.MONGO_URI is from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected! 🚀');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1); 
  }
};

// Call the function to connect
connectDB();

// --- API Routes ---
// Any request to /api/snippets will be handled by our router
app.use('/api/snippets', snippetRoutes);
app.use('/api/auth', authRoutes); 

// --- Simple Test Route ---
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the server! 👋" });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});