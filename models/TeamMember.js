
import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a team member name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    designation: {
        type: String,
        required: [true, 'Please provide a designation.'],
        maxlength: [100, 'Designation cannot be more than 100 characters'],
    },
    image: {
        type: String,
        required: [true, 'Please provide an image URL.'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    category: {
        type: String,
        required: true,
        enum: ['Core', 'Senior', 'Member', 'Admin', 'Other'],
        default: 'Member',
    },
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        instagram: String,
        facebook: String,
    },
    sortOrder: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

TeamMemberSchema.index({ category: 1 });
TeamMemberSchema.index({ sortOrder: 1 });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
