import { Team } from '@/lib/types';
import request from '@/lib/api-client';

export async function getTeams(): Promise<Team[]> {
  const teams = await request('/teams');
  // Compute totalMembers on the frontend as requested
  return teams.map((team: Team) => ({
    ...team,
    totalMembers: team.members.length,
  }));
}

export async function createTeam(team: { name: string, companyId: number, members: number[] }): Promise<Team> {
    return request('/teams', {
        method: 'POST',
        body: JSON.stringify(team),
    });
}

export async function updateTeam(id: number, team: Partial<{ name: string, companyId: number, members: number[] }>): Promise<Team> {
    return request(`/teams/${id}`, {
        method: 'PUT', // Assuming PUT for updates
        body: JSON.stringify(team),
    });
}

export async function deleteTeam(id: number): Promise<void> {
    return request(`/teams/${id}`, {
        method: 'DELETE',
    });
}
