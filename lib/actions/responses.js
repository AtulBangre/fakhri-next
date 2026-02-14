'use server';

import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Feedback from '@/models/Feedback';
import JobApplication from '@/models/JobApplication';
import User from '@/models/User';
import { createNotification } from '@/lib/actions/notification';
import { revalidatePath } from 'next/cache';

// Helper: notify all super-admins about an event
async function notifySuperAdmins({ title, message, type = 'info', link = '#Responses' }) {
    try {
        await connectDB();
        const superAdmins = await User.find({ role: 'super-admin' }).select('_id').lean();
        await Promise.all(
            superAdmins.map(sa =>
                createNotification({
                    recipientId: sa._id,
                    title,
                    message,
                    type,
                    link
                })
            )
        );
    } catch (error) {
        console.error('Error notifying super-admins:', error);
    }
}

// --- SUBMIT ACTIONS ---

export async function submitContactForm(data) {
    await connectDB();
    try {
        const contact = await Contact.create(data);

        await notifySuperAdmins({
            title: 'New Contact Inquiry',
            message: `New message from ${data.name} regarding ${data.service || 'General Inquiry'}`,
            type: 'contact',
            link: '/super-admin/dashboard?tab=responses&subtab=contact'
        });

        return { success: true, id: contact._id.toString() };
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return { success: false, error: error.message };
    }
}

export async function submitJobApplication(data) {
    await connectDB();
    try {
        const application = await JobApplication.create(data);

        await notifySuperAdmins({
            title: 'New Job Application',
            message: `${data.fullName} applied for ${data.jobTitle || 'a position'}`,
            type: 'career',
            link: '/super-admin/dashboard?tab=responses&subtab=career'
        });

        return { success: true, id: application._id.toString() };
    } catch (error) {
        console.error('Error submitting job application:', error);
        return { success: false, error: error.message };
    }
}

export async function submitClientFeedback(data) {
    await connectDB();
    try {
        const feedback = await Feedback.create(data);

        await notifySuperAdmins({
            title: 'New Client Feedback',
            message: `${data.clientName || 'A client'} submitted new feedback (${data.rating}/5)`,
            type: 'feedback', // making it distinct
            link: '/super-admin/dashboard?tab=responses&subtab=feedback'
        });

        revalidatePath('/client/dashboard');
        return { success: true, id: feedback._id.toString() };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
    }
}

// --- FETCH ACTIONS ---

export async function getAllResponses() {
    await connectDB();
    try {
        const [feedback, contacts, applications] = await Promise.all([
            Feedback.find().sort({ createdAt: -1 }).populate('client', 'name email company').lean(),
            Contact.find().sort({ createdAt: -1 }).lean(),
            JobApplication.find().sort({ createdAt: -1 }).lean()
        ]);

        return {
            feedback: JSON.parse(JSON.stringify(feedback)),
            contacts: JSON.parse(JSON.stringify(contacts)),
            applications: JSON.parse(JSON.stringify(applications))
        };
    } catch (error) {
        console.error('Error fetching responses:', error);
        return { feedback: [], contacts: [], applications: [] };
    }
}

// --- UPDATE ACTIONS ---

export async function updateResponseStatus(type, id, status) {
    await connectDB();
    try {
        let Model;
        switch (type) {
            case 'feedback': Model = Feedback; break;
            case 'contact': Model = Contact; break;
            case 'career': Model = JobApplication; break;
            default: throw new Error('Invalid response type');
        }

        await Model.findByIdAndUpdate(id, { status });
        revalidatePath('/super-admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteResponse(type, id) {
    await connectDB();
    try {
        let Model;
        switch (type) {
            case 'feedback': Model = Feedback; break;
            case 'contact': Model = Contact; break;
            case 'career': Model = JobApplication; break;
            default: throw new Error('Invalid response type');
        }

        await Model.findByIdAndDelete(id);
        revalidatePath('/super-admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting response:', error);
        return { success: false, error: error.message };
    }
}
