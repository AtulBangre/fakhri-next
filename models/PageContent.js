
import mongoose from 'mongoose';

/*
 * Schema for storing unstructured/semi-structured page content.
 * Used for:
 * - Home page (Hero, Features, Stats)
 * - About page (Hero, Overview, Timeline, WhyChooseUs)
 * - Careers page (Benefits)
 * - Contact page (Contact Info)
 * - Privacy/Terms static text (optional)
 * - Within 2 Hours (Static info)
 */

const PageContentSchema = new mongoose.Schema({
    page: {
        type: String, // e.g., 'home', 'about', 'services', 'pricing', 'contact', 'career', 'within2hours'
        required: true,
        unique: true,
        index: true,
    },
    hero: {
        title: String,
        subtitle: String,
        badge: String,
        image: String,
        ctaText: String,
        ctaLink: String,
        stats: [{ label: String, value: String }] // e.g., years exp
    },
    sections: {
        type: Map,
        of: mongoose.Schema.Types.Mixed // Flexible content for other sections
    },
    seo: {
        title: String,
        description: String,
        keywords: String,
        ogImage: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

export default mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);
