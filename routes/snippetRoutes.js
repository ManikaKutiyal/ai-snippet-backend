import express from 'express';
import Snippet from '../models/Snippet.js'; // Go up one level (..) to find models
import { GoogleGenerativeAI } from '@google/generative-ai'; 

const router = express.Router();

// --- GET ALL SNIPPETS ---
// Route: GET /api/snippets/
router.get('/', async (req, res) => {
  try {
    // Find all snippets and sort them by newest first
    const snippets = await Snippet.find().sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while getting snippets' });
  }
});

// --- CREATE A NEW SNIPPET ---
// Route: POST /api/snippets/
router.post('/', async (req, res) => {
  try {
    // Get the data from the request body
    const { title, code, language, tags } = req.body;

    // Basic validation
    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code, and language are required' });
    }

    const newSnippet = new Snippet({
      title,
      code,
      language,
      // Split tags string into an array, trim whitespace
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [] 
    });

    const savedSnippet = await newSnippet.save();
    res.status(201).json(savedSnippet); // 201 = "Created"
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating snippet' });
  }
});
// --- UPDATE A SNIPPET ---
// Route: PUT /api/snippets/:id
router.put('/:id', async (req, res) => {
  try {
    const snippetId = req.params.id;
    // Get the new data from the request body
    const { title, code, language, tags } = req.body;

    // Validation
    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code, and language are required' });
    }

    const updatedData = {
      title,
      code,
      language,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    // Find the snippet by its ID and update it
    // { new: true } tells Mongoose to return the *updated* document
    const updatedSnippet = await Snippet.findByIdAndUpdate(snippetId, updatedData, { new: true });

    if (!updatedSnippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json(updatedSnippet); // Send back the updated snippet
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating snippet' });
  }
});
// --- DELETE A SNIPPET ---
// Route: DELETE /api/snippets/:id
router.delete('/:id', async (req, res) => {
  try {
    const snippetId = req.params.id;

    // Find the snippet by its ID and delete it
    const deletedSnippet = await Snippet.findByIdAndDelete(snippetId);

    if (!deletedSnippet) {
      // If no snippet was found with that ID
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Send back a success message
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting snippet' });
  }
});
// --- AI GENERATION ROUTE (WORKING) ---
// Route: POST /api/snippets/generate
router.post('/generate', async (req, res) => {
  // Make sure GEMINI_API_KEY is in your .env file
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"}); 

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  console.log("AI prompt received:", prompt);

  try {
    // 1. Create a detailed prompt asking the AI for JSON
    const aiPrompt = `
      Generate a code snippet based on the following prompt: "${prompt}"

      You MUST respond with ONLY a valid JSON object.
      The JSON object should have two keys:
      1. "code": A string containing the generated code.
      2. "language": A string (in lowercase) of the code's language (e.g., "javascript", "python", "css").
      
      Do not include any other text, explanations, or markdown formatting like \`\`\`json.
    `;

    // 2. Call the AI model
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const aiText = await response.text();

    console.log("AI Raw Response:", aiText);

    // 3. Parse the JSON text from the AI
    // We wrap this in a try/catch in case the AI doesn't return perfect JSON
    try {
      const aiJson = JSON.parse(aiText);
      
      // 4. Send the parsed code and language back to the frontend
      res.json({
        code: aiJson.code,
        language: aiJson.language
      });

    } catch (parseError) {
      console.error("Error parsing AI JSON response:", parseError);
      console.error("AI text that failed to parse:", aiText);
      res.status(500).json({ message: "AI returned an invalid format. Please try again." });
    }

  } catch (error) {
    console.error("Error calling Generative AI:", error);
    res.status(500).json({ message: 'Error generating AI code' });
  }
});
export default router;