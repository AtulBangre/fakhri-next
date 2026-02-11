'use server';

import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import FAQ from '@/models/FAQ';
import TeamMember from '@/models/TeamMember';
import Testimonial from '@/models/Testimonial';
import PricingPlan from '@/models/PricingPlan';

export async function getServices() {
    await connectDB();
    try {
        const services = await Service.find({}).sort({ order: 1 }).lean();
        return JSON.parse(JSON.stringify(services));
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

export async function getFAQs(category = '') {
    await connectDB();
    try {
        const query = category ? { category } : {};
        const faqs = await FAQ.find(query).sort({ order: 1 }).lean();
        return JSON.parse(JSON.stringify(faqs));
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }
}

export async function getTeamMembers() {
    await connectDB();
    try {
        const members = await TeamMember.find({}).sort({ category: 1, order: 1 }).lean();
        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
}

export async function getTestimonials() {
    await connectDB();
    try {
        const testimonials = await Testimonial.find({}).lean();
        return JSON.parse(JSON.stringify(testimonials));
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return [];
    }
}

export async function getPricingPlans() {
    await connectDB();
    try {
        const plans = await PricingPlan.find({}).lean();
        return JSON.parse(JSON.stringify(plans));
    } catch (error) {
        console.error('Error fetching pricing plans:', error);
        return [];
    }
}
