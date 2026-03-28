import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SuccessStory', storySchema);
