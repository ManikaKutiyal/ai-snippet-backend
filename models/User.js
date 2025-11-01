import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // We'll use email to log in, as it's always unique
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// --- Password Hashing Middleware ---
// This function runs automatically *before* a new user is saved
userSchema.pre('save', async function (next) {
  // 'this' refers to the user document about to be saved
  
  // Only hash the password if it's new or has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // "Salt" makes the hash more secure
    const salt = await bcrypt.genSalt(10);
    // Replaces the plain-text password with the hashed one
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;