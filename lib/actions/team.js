'use server';

import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';

export async function getTeams() {
    await connectDB();
    try {
        const teams = await Team.find({})
            .populate('leadId', 'name email')
            .lean();
        return JSON.parse(JSON.stringify(teams));
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
}

export async function getTeamWithMembers(teamId) {
    await connectDB();
    try {
        const team = await Team.findById(teamId)
            .populate('leadId', 'name email adminRole')
            .populate('memberIds', 'name email adminRole performance status')
            .lean();
        return JSON.parse(JSON.stringify(team));
    } catch (error) {
        console.error('Error fetching team with members:', error);
        return null;
    }
}
