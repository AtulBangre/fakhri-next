'use server';

import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';

export async function getTeams() {
    await connectDB();
    try {
        const teams = await Team.find({})
            .populate('leadId', 'name email adminRole')
            .populate('memberIds', 'name email adminRole')
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

export async function createTeam(teamData) {
    await connectDB();
    try {
        const newTeam = await Team.create(teamData);
        return JSON.parse(JSON.stringify(newTeam));
    } catch (error) {
        console.error('Error creating team:', error);
        throw new Error(error.message || 'Failed to create team');
    }
}

export async function updateTeam(teamId, teamData) {
    await connectDB();
    try {
        const updatedTeam = await Team.findByIdAndUpdate(teamId, teamData, { new: true })
            .populate('leadId', 'name email adminRole')
            .populate('memberIds', 'name email adminRole')
            .lean();
        return JSON.parse(JSON.stringify(updatedTeam));
    } catch (error) {
        console.error('Error updating team:', error);
        throw new Error(error.message || 'Failed to update team');
    }
}

export async function deleteTeam(teamId) {
    await connectDB();
    try {
        await Team.findByIdAndDelete(teamId);
        return { success: true };
    } catch (error) {
        console.error('Error deleting team:', error);
        throw new Error(error.message || 'Failed to delete team');
    }
}
