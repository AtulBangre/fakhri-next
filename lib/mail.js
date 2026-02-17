import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html, text }) {
    try {
        const info = await transporter.sendMail({
            from: `"Fakhri IT Services" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

export const emailTemplates = {
    contactForm: (data) => ({
        subject: `New Contact Inquiry from ${data.name}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">New Contact Inquiry</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${data.subject || 'General Inquiry'}</p>
                <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin-top: 20px;">
                    <p><strong>Message:</strong></p>
                    <p>${data.message}</p>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">This email was sent from the contact form on Maurya technologies.</p>
            </div>
        `,
        text: `New Contact Inquiry\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nSubject: ${data.subject || 'General Inquiry'}\n\nMessage:\n${data.message}`
    }),

    contactAcknowledgment: (data) => ({
        subject: `Thank you for contacting Fakhri IT Services`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Hi ${data.name},</h2>
                <p>Thank you for reaching out to us. We have received your inquiry and our team will get back to you shortly.</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <p><strong>Your Message:</strong></p>
                    <p>${data.message}</p>
                </div>
                <p style="margin-top: 20px;">Best Regards,<br><strong>The Fakhri IT Team</strong></p>
            </div>
        `,
        text: `Hi ${data.name},\n\nThank you for reaching out to us. We have received your inquiry and our team will get back to you shortly.\n\nBest Regards,\nThe Fakhri IT Team`
    })
};
