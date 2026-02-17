'use server';

import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Feedback from '@/models/Feedback';
import JobApplication from '@/models/JobApplication';
import ProfileUpdateRequest from '@/models/ProfileUpdateRequest';
import User from '@/models/User';
import { createNotification } from '@/lib/actions/notification';
import { revalidatePath } from 'next/cache';
import { sendEmail, emailTemplates } from '@/lib/mail';

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

        // Notify Super Admins via In-App Notification
        await notifySuperAdmins({
            title: 'New Contact Inquiry',
            message: `New message from ${data.name} regarding ${data.service || 'General Inquiry'}`,
            type: 'contact',
            link: '/super-admin/dashboard?tab=responses&subtab=contact'
        });

        // Send Email to Admin
        const adminEmail = emailTemplates.contactForm(data);
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
            ...adminEmail
        });

        // Send Email to User (Acknowledgment)
        const userEmail = emailTemplates.contactAcknowledgment(data);
        await sendEmail({
            to: data.email,
            ...userEmail
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

    console.log("Fetching all responses...");

    // Helper to fetch safely
    const fetchSafely = async (promise, name, fallback = []) => {
        try {
            return await promise;
        } catch (error) {
            console.error(`Error fetching ${name}:`, error);
            // Specifically for debug, return mock error item if ProfileRequests fails
            if (name === 'ProfileRequests') {
                return [{
                    _id: 'error-debug',
                    userName: 'Fetch Error',
                    userRole: 'system',
                    newData: { error: error.message },
                    oldData: { stack: error.stack },
                    status: 'rejected',
                    createdAt: new Date().toISOString()
                }];
            }
            return fallback;
        }
    };

    const feedbackPromise = Feedback.find().sort({ createdAt: -1 }).populate('client', 'name email company').lean();
    const contactsPromise = Contact.find().sort({ createdAt: -1 }).lean();
    const applicationsPromise = JobApplication.find().sort({ createdAt: -1 }).lean();

    // Use the model explicitly, ensure it is connected
    const profileRequestsPromise = ProfileUpdateRequest.find().sort({ createdAt: -1 }).lean();

    const [feedback, contacts, applications, profileRequestsRaw] = await Promise.all([
        fetchSafely(feedbackPromise, 'Feedback'),
        fetchSafely(contactsPromise, 'Contacts'),
        fetchSafely(applicationsPromise, 'JobApplications'),
        fetchSafely(profileRequestsPromise, 'ProfileRequests')
    ]);

    // Manual population for profile requests
    try {
        if (profileRequestsRaw.length > 0 && !profileRequestsRaw[0].error) {
            await ProfileUpdateRequest.populate(profileRequestsRaw, [{ path: 'user' }, { path: 'client' }]);
        }
    } catch (e) {
        console.error("Population error:", e);
    }

    console.log(`Fetched: ${feedback.length} feedback, ${contacts.length} contacts, ${applications.length} applications, ${profileRequestsRaw.length} profile requests`);

    let profileRequests = [];
    try {
        profileRequests = profileRequestsRaw.map(r => {
            const userObj = r.user || r.client;
            return {
                ...r,
                user: userObj,
                userName: r.userName || (userObj?.name || r.clientName || "Unknown"),
                userRole: r.userRole || (userObj?.role || "client"),
                newData: r.newData || {},
                oldData: r.oldData || {}
            };
        });
    } catch (err) {
        console.error("Error normalizing profile requests:", err);
    }

    return {
        feedback: JSON.parse(JSON.stringify(feedback)),
        contacts: JSON.parse(JSON.stringify(contacts)),
        applications: JSON.parse(JSON.stringify(applications)),
        profileRequests: JSON.parse(JSON.stringify(profileRequests))
    };
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
            case 'profile-update': Model = ProfileUpdateRequest; break;
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
