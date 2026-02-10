
import dbConnect from '@/lib/mongodb';
import PageContent from '@/models/PageContent';
import Job from '@/models/Job';
import Service from '@/models/Service';
import Plan from '@/models/Plan';
import BlogPost from '@/models/BlogPost';
import TeamMember from '@/models/TeamMember';
import Testimonial from '@/models/Testimonial';
import Faq from '@/models/Faq';
import Product from '@/models/Product';

// Helper to jsonify lean documents (handle _id and dates)
const jsonify = (doc) => JSON.parse(JSON.stringify(doc));

export async function getPageContent(page) {
    await dbConnect();
    const content = await PageContent.findOne({ page }).lean();
    return content ? jsonify(content) : null;
}

export async function getJobs() {
    await dbConnect();
    const jobs = await Job.find({ isActive: true }).sort('sortOrder').lean();
    return jsonify(jobs);
}

export async function getServices() {
    await dbConnect();
    const services = await Service.find({ isActive: true }).sort('sortOrder').lean();
    return jsonify(services);
}

export async function getPlans() {
    await dbConnect();
    const plans = await Plan.find({ isActive: true }).sort('sortOrder').lean();
    return jsonify(plans);
}

export async function getBlogPosts() {
    await dbConnect();
    const posts = await BlogPost.find({ isPublished: true }).sort('-createdAt').lean();
    return jsonify(posts);
}

export async function getBlogPostBySlug(slug) {
    await dbConnect();
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
    return post ? jsonify(post) : null;
}

export async function getTeamMembers() {
    await dbConnect();
    const members = await TeamMember.find({}).sort('sortOrder').lean();
    return jsonify(members);
}

export async function getTestimonials() {
    await dbConnect();
    const testimonials = await Testimonial.find({ isActive: true }).sort('sortOrder').lean();
    return jsonify(testimonials);
}

export async function getFaqs(category) {
    await dbConnect();
    const query = category ? { category } : {};
    const faqs = await Faq.find(query).sort('sortOrder').lean();
    return jsonify(faqs);
}

export async function getWithin2HoursProducts() {
    await dbConnect();
    const products = await Product.find({ isWithin2Hours: true }).sort('sortOrder').lean();
    return jsonify(products);
}

export async function getNavigation() {
    await dbConnect();
    const content = await PageContent.findOne({ page: 'navigation' }).lean();
    return content ? jsonify(content.sections) : null;
}

export async function getCompanyInfo() {
    await dbConnect();
    const content = await PageContent.findOne({ page: 'company' }).lean();
    return content ? jsonify(content.sections) : null;
}
