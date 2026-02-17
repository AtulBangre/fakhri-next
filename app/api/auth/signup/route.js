import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists with this email" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user as client
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "client",
            status: "active",
        });

        // Send Welcome Email
        try {
            const { sendEmail, emailTemplates } = await import("@/lib/mail");
            const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/dashboard#Plan`;

            await sendEmail({
                to: email,
                ...emailTemplates.welcomeClient({
                    name,
                    dashboardUrl
                })
            });
            console.log(`Welcome email sent to ${email}`);
        } catch (mailError) {
            console.error("Failed to send welcome email:", mailError);
            // Don't block registration if email fails
        }

        // Create Welcome Notification in Dashboard
        try {
            const { createNotification } = await import("@/lib/actions/notification");
            await createNotification({
                recipientId: newUser._id,
                title: "Welcome to Fakhri IT Services!",
                message: "We're excited to have you on board. Please check out our pricing plans to get started with our premium services.",
                type: "info",
                link: "#Plan", // Direct link to Plan tab
                icon: "Star",
                skipEmail: true
            });
        } catch (notifError) {
            console.error("Failed to create welcome notification:", notifError);
        }

        return NextResponse.json(
            { message: "User created successfully", user: { id: newUser._id, email: newUser.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
