import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    noteId: {
        type: String,
        required: true,
        unique: true,
    },
    // Relationships
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    authorName: String,
    // Note content
    content: {
        type: String,
        required: [true, 'Please provide note content'],
    },
    // Type of note
    type: {
        type: String,
        enum: ['general', 'meeting', 'phone', 'email', 'internal', 'task'],
        default: 'general',
    },
    // Related entities
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    // Visibility
    isPrivate: {
        type: Boolean,
        default: false,
    },
    // Pinned
    isPinned: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Indexes

NoteSchema.index({ client: 1 });
NoteSchema.index({ author: 1 });
NoteSchema.index({ type: 1 });
NoteSchema.index({ createdAt: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
