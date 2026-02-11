import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    date: { type: String }
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
