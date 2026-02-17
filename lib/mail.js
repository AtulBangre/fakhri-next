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

export async function sendEmail({ to, subject, html, text, replyTo, fromName }) {
    try {
        const smtpUser = process.env.SMTP_USER;

        // If fromName and replyTo are provided, we show "Admin Name <admin@email.com>" 
        // as the display name, while the technical sender remains the SMTP_USER.
        const fromDisplayName = fromName && replyTo
            ? `${fromName} <${replyTo}>`
            : (fromName || 'Fakhri IT Services');

        console.log(`[Email] Sending to: ${to} | on behalf of: ${fromDisplayName}`);

        const info = await transporter.sendMail({
            from: `"${fromDisplayName}" <${smtpUser}>`,
            to,
            subject,
            text,
            html,
            replyTo: replyTo || smtpUser,
        });

        console.log(`[Email] Success! ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email] Error details:', error.message);
        return { success: false, error: error.message };
    }
}

export const emailTemplates = {
    contactForm: (data) => ({
        subject: `New Contact Inquiry from ${data.name}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #880808;">New Contact Inquiry</h2>
                <div style="background: #fdf2f2; padding: 15px; border-left: 4px solid #880808; margin-top: 20px;">
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                    <p><strong>Subject:</strong> ${data.subject || 'General Inquiry'}</p>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-top: 1px solid #eee; margin-top: 20px;">
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${data.message}</p>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">This email was sent from the contact form on Maurya Technologies.</p>
            </div>
        `,
        text: `New Contact Inquiry\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nSubject: ${data.subject || 'General Inquiry'}\n\nMessage:\n${data.message}`
    }),

    contactAcknowledgment: (data) => ({
        subject: `Thank you for contacting Fakhri IT Services`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #880808;">
                    <h1 style="color: #880808; margin: 0; font-size: 24px;">Fakhri IT Services</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <h2 style="color: #333; margin-top: 0;">Hi ${data.name},</h2>
                    <p style="color: #555; line-height: 1.6;">Thank you for reaching out to us. We have received your inquiry and our team will get back to you shortly.</p>
                    <div style="background: #fdf2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #880808; margin-top: 25px;">
                        <p style="margin-top: 0; font-weight: bold; color: #880808;">Your Message:</p>
                        <p style="color: #444; margin-bottom: 0; font-style: italic;">"${data.message}"</p>
                    </div>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
                    <p style="margin: 0; color: #777; font-size: 14px;">Best Regards,<br><strong style="color: #880808;">The Fakhri IT Team</strong></p>
                </div>
            </div>
        `,
        text: `Hi ${data.name},\n\nThank you for reaching out to us. We have received your inquiry and our team will get back to you shortly.\n\nBest Regards,\nThe Fakhri IT Team`
    }),

    clientMessage: (data) => ({
        subject: data.subject || "Important Update from Fakhri IT Services",
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
                <!-- Header with Brand Color -->
                <div style="background-color: #880808; padding: 25px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">FAKHRI IT SERVICES</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase;">Premium Tech Solutions</p>
                </div>

                <!-- Content Area -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px; font-weight: 600;">Hello,</h2>
                    <div style="color: #4a4a4a; line-height: 1.8; font-size: 16px;">
                        ${data.body.replace(/\n/g, '<br>')}
                    </div>
                </div>

                <!-- Sign-off -->
                <div style="padding: 0 30px 40px 30px;">
                    <div style="border-top: 1px solid #f0f0f0; padding-top: 30px;">
                        <p style="margin: 0; color: #1a1a1a; font-weight: 600;">Best Regards,</p>
                        <p style="margin: 5px 0 0 0; color: #880808; font-size: 18px; font-weight: 700;">${data.adminName}</p>
                        <p style="margin: 2px 0 0 0; color: #777; font-size: 13px;">Account Manager | Fakhri IT Services</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; color: #999; font-size: 12px;">
                        Digital Goods & IT Services Excellence<br>
                        © ${new Date().getFullYear()} Fakhri IT Services. All rights reserved.
                    </p>
                </div>
            </div>
        `,
        text: `Hello,\n\n${data.body}\n\nBest Regards,\n${data.adminName}\nAccount Manager | Fakhri IT Services`
    }),

    notification: (data) => ({
        subject: `[Notification] ${data.title}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #880808; padding: 15px 25px;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">Fakhri IT Services</h2>
                </div>
                <div style="padding: 30px;">
                    <h3 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">${data.title}</h3>
                    <p style="color: #4a4a4a; line-height: 1.6; font-size: 15px;">${data.message}</p>
                    ${data.link && data.link !== '#' ? `
                        <div style="margin-top: 25px;">
                            <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background-color: #880808; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Details</a>
                        </div>
                    ` : ''}
                </div>
                <div style="background-color: #f8f9fa; padding: 15px 25px; border-top: 1px solid #eeeeee; text-align: center;">
                    <p style="margin: 0; color: #999; font-size: 11px;">You received this email because a notification was triggered for your account.</p>
                </div>
            </div>
        `,
        text: `Fakhri IT Services Notification\n\n${data.title}\n${data.message}\n\nView Details: ${data.link}`
    })
};

export async function verifySMTP() {
    try {
        await transporter.verify();
        return { success: true };
    } catch (error) {
        console.error('SMTP Verification Failed:', error);
        return { success: false, error: error.message };
    }
}
