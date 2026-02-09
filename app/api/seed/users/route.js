import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        const users = [
            {
                email: 'kuldeepmaurya4296@gmail.com',
                password: '123456',
                role: 'super-admin',
                name: 'Super Admin User',
                status: 'active',
                sessionVersion: 1
            },
            {
                email: 'k6263638053@gmail.com',
                password: '123456',
                role: 'admin', // Explicitly 'admin' role, effectively acts as Admin.
                name: 'Admin User',
                status: 'active',
                sessionVersion: 1
            },
            {
                email: '2604atulbangre@gmail.com',
                password: '123456',
                role: 'client',
                name: 'Client User',
                status: 'active',
                sessionVersion: 1
            }
        ];

        const results = [];

        for (const userValues of users) {
            const existingUser = await User.findOne({ email: userValues.email });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userValues.password, 10);
                const newUser = await User.create({
                    ...userValues,
                    password: hashedPassword
                });
                results.push({ email: newUser.email, status: 'Created', role: newUser.role });
            } else {
                // Update role and password to ensure credentials work
                const hashedPassword = await bcrypt.hash(userValues.password, 10);
                existingUser.password = hashedPassword;
                existingUser.role = userValues.role;
                existingUser.status = 'active';
                if (!existingUser.sessionVersion) existingUser.sessionVersion = 1;
                await existingUser.save();
                results.push({ email: existingUser.email, status: 'Updated', role: existingUser.role });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
