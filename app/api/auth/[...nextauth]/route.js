import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password');
                }

                await dbConnect();

                // Find user and include password field
                const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

                if (!user) {
                    throw new Error('No user found with this email');
                }

                // Check password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                // Check if user is active
                if (user.status === 'suspended') {
                    throw new Error('Your account has been suspended. Please contact support.');
                }

                // Update last login and increment session version (invalidate old sessions)
                user.lastLogin = new Date();
                user.sessionVersion = (user.sessionVersion || 0) + 1;
                await user.save();

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.avatar,
                    company: user.company,
                    planName: user.planName,
                    sessionVersion: user.sessionVersion,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in (Credentials or Google)
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.company = user.company;
                token.planName = user.planName;
                token.sessionVersion = user.sessionVersion;
            }

            // Google OAuth - create or update user
            if (account?.provider === 'google') {
                await dbConnect();

                let dbUser = await User.findOne({ email: token.email });

                if (!dbUser) {
                    // Create new user from Google OAuth
                    dbUser = await User.create({
                        name: token.name,
                        email: token.email,
                        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                        role: 'client',
                        status: 'pending',
                        avatar: token.picture,
                        googleId: account.providerAccountId,
                        isGoogleUser: true,
                        sessionVersion: 1, // Start with version 1
                    });
                } else {
                    // Update existing user
                    let updates = { lastLogin: new Date() };

                    if (!dbUser.googleId) {
                        updates.googleId = account.providerAccountId;
                        updates.isGoogleUser = true;
                    }

                    // Increment session version to invalidate other sessions
                    updates.sessionVersion = (dbUser.sessionVersion || 0) + 1;

                    dbUser = await User.findByIdAndUpdate(dbUser._id, updates, { new: true });
                }

                token.id = dbUser._id.toString();
                token.role = dbUser.role;
                token.company = dbUser.company;
                token.planName = dbUser.planName;
                token.sessionVersion = dbUser.sessionVersion;
            }

            // Session Validation (Single Session Enforcement)
            if (!user && !account && token.id) {
                await dbConnect();
                // Check if session version matches DB
                const dbUser = await User.findById(token.id).select('sessionVersion');

                // If user doesn't exist or version mismatch, invalidate token
                if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
                    return null; // Force sign out
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.company = token.company;
                session.user.planName = token.planName;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
