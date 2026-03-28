import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  topic: String,
});

export default mongoose.model('Session', sessionSchema);
