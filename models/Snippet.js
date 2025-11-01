import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  // This is the link to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  tags: {
    type: [String], // An array of strings
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Snippet = mongoose.model('Snippet', snippetSchema);

export default Snippet;