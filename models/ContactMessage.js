import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true,
    },
    // Contact information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please provide a valid phone number'],
    },
    company: {
        type: String,
        trim: true,
        maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    // Message details
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    // Categorization
    category: {
        type: String,
        enum: ['general', 'sales', 'support', 'partnership', 'career', 'feedback', 'other'],
        default: 'general',
    },
    source: {
        type: String,
        enum: ['website', 'email', 'phone', 'referral', 'social', 'other'],
        default: 'website',
    },
    // Service interest (if applicable)
    interestedService: {
        type: String,
    },
    interestedPlan: {
        type: String,
        enum: ['elite', 'premium', 'platinum', null],
    },
    // Status tracking
    status: {
        type: String,
        enum: ['new', 'in-progress', 'responded', 'resolved', 'spam', 'archived'],
        default: 'new',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedToName: String,
    // Response tracking
    responses: [{
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        respondedByName: String,
        message: String,
        respondedAt: {
            type: Date,
            default: Date.now,
        },
        method: {
            type: String,
            enum: ['email', 'phone', 'in-app'],
            default: 'email',
        },
    }],
    firstResponseAt: Date,
    resolvedAt: Date,
    // Metadata
    ipAddress: String,
    userAgent: String,
    referrer: String,
    // Tags for organization
    tags: [String],
    // Internal notes
    internalNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        addedByName: String,
        addedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    // Spam detection
    isSpam: {
        type: Boolean,
        default: false,
    },
    spamScore: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes
ContactMessageSchema.index({ messageId: 1 });
ContactMessageSchema.index({ email: 1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ priority: 1 });
ContactMessageSchema.index({ category: 1 });
ContactMessageSchema.index({ assignedTo: 1 });
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ isSpam: 1 });

// Virtual for response time
ContactMessageSchema.virtual('responseTime').get(function () {
    if (this.firstResponseAt && this.createdAt) {
        return this.firstResponseAt - this.createdAt;
    }
    return null;
});

// Pre-save middleware to generate messageId
ContactMessageSchema.pre('save', async function (next) {
    if (!this.messageId) {
        const count = await mongoose.model('ContactMessage').countDocuments();
        this.messageId = `MSG-${(count + 1).toString().padStart(6, '0')}`;
    }
    next();
});

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
