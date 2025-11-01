import express from 'express';
import Snippet from '../models/Snippet.js';
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import auth from '../middleware/auth.js'; // <-- 1. IMPORT OUR NEW MIDDLEWARE

const router = express.Router();

// --- GET ALL OF THE *LOGGED-IN USER'S* SNIPPETS ---
// Route: GET /api/snippets/
// We add 'auth' as the second argument. It runs *before* the async function.
router.get('/', auth, async (req, res) => {
  try {
    // --- MODIFIED ---
    // We now use req.user.id (which our middleware gave us)
    // This finds *only* snippets where the 'user' field matches the logged-in user's ID
    const snippets = await Snippet.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while getting snippets' });
  }
});

// --- CREATE A NEW SNIPPET (FOR THE LOGGED-IN USER) ---
// Route: POST /api/snippets/
router.post('/', auth, async (req, res) => {
  try {
    const { title, code, language, tags } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code, and language are required' });
    }

    const newSnippet = new Snippet({
      title,
      code,
      language,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      user: req.user.id // <-- 2. SET THE 'user' FIELD TO THE LOGGED-IN USER'S ID
    });

    const savedSnippet = await newSnippet.save();
    res.status(201).json(savedSnippet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating snippet' });
  }
});

// --- UPDATE A SNIPPET (AND CHECK OWNERSHIP) ---
// Route: PUT /api/snippets/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const snippetId = req.params.id;
    const { title, code, language, tags } = req.body;

    // --- 3. ADD OWNERSHIP CHECK ---
    let snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // This is the crucial security check
    // If the snippet's 'user' ID doesn't match the logged-in user's ID, deny it
    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    // --- END OWNERSHIP CHECK ---

    const updatedData = {
      title,
      code,
      language,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    const updatedSnippet = await Snippet.findByIdAndUpdate(snippetId, updatedData, { new: true });
    res.json(updatedSnippet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating snippet' });
  }
});

// --- DELETE A SNIPPET (AND CHECK OWNERSHIP) ---
// Route: DELETE /api/snippets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const snippetId = req.params.id;

    // --- 4. ADD OWNERSHIP CHECK ---
    let snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // The same security check as UPDATE
    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    // --- END OWNERSHIP CHECK ---

    await Snippet.findByIdAndDelete(snippetId);
    res.json({ message: 'Snippet deleted successfully' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting snippet' });
  }
});

// --- AI GENERATION ROUTE (NOW PROTECTED) ---
// Route: POST /api/snippets/generate
// We protect this route too, so only logged-in users can use your AI key.
router.post('/generate', auth, async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"}); 

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  console.log("AI prompt received:", prompt);

  try {
    // (The rest of your AI logic is perfect, no changes needed here)
    const aiPrompt = `
      Generate a code snippet based on the following prompt: "${prompt}"
      You MUST respond with ONLY a valid JSON object.
      The JSON object should have two keys:
      1. "code": A string containing the generated code.
      2. "language": A string (in lowercase) of the code's language (e.g., "javascript", "python", "css").
      Do not include any other text, explanations, or markdown formatting like \`\`\`json.
    `;
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const aiText = await response.text();

    console.log("AI Raw Response:", aiText);

    try {
      const aiJson = JSON.parse(aiText);
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