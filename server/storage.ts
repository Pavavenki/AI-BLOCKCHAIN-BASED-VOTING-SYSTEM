import { 
  voters, candidates, votes, admins,
  type Voter, type InsertVoter,
  type Candidate, type InsertCandidate,
  type Vote, type InsertVote,
  type Admin, type InsertAdmin
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // Voter methods
  getVoter(id: number): Promise<Voter | undefined>;
  getVoterByVoterId(voterId: string): Promise<Voter | undefined>;
  createVoter(voter: InsertVoter): Promise<Voter>;
  updateVoter(id: number, voter: Partial<InsertVoter>): Promise<Voter | undefined>;
  deleteVoter(id: number): Promise<void>;
  getAllVoters(): Promise<Voter[]>;
  updateVoterStatus(id: number, hasVoted: boolean): Promise<void>;

  // Candidate methods
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<void>;
  getAllCandidates(): Promise<Candidate[]>;
  getCandidatesByConstituency(constituency: string): Promise<Candidate[]>;
  getCandidatesCount(): Promise<number>;

  // Vote methods
  recordVote(vote: InsertVote): Promise<Vote>;
  getVoteByVoterId(voterId: string): Promise<Vote | undefined>;
  getAllVotes(): Promise<Vote[]>;

  // Admin methods
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Results methods
  getAllResults(): Promise<any[]>;
  getResultsByConstituency(constituency: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Voter methods
  async getVoter(id: number): Promise<Voter | undefined> {
    const result = await db.select().from(voters).where(eq(voters.id, id));
    return result[0];
  }

  async getVoterByVoterId(voterId: string): Promise<Voter | undefined> {
    const result = await db.select().from(voters).where(eq(voters.voterId, voterId));
    return result[0];
  }

  async createVoter(voter: InsertVoter): Promise<Voter> {
    const [newVoter] = await db.insert(voters).values(voter).returning();
    return newVoter;
  }

  async updateVoter(id: number, voterData: Partial<InsertVoter>): Promise<Voter | undefined> {
    const [updatedVoter] = await db
      .update(voters)
      .set(voterData)
      .where(eq(voters.id, id))
      .returning();
    return updatedVoter;
  }

  async deleteVoter(id: number): Promise<void> {
    await db.delete(voters).where(eq(voters.id, id));
  }

  async getAllVoters(): Promise<Voter[]> {
    return db.select().from(voters);
  }

  async updateVoterStatus(id: number, hasVoted: boolean): Promise<void> {
    await db
      .update(voters)
      .set({ hasVoted })
      .where(eq(voters.id, id));
  }

  // Candidate methods
  async getCandidate(id: number): Promise<Candidate | undefined> {
    const result = await db.select().from(candidates).where(eq(candidates.id, id));
    return result[0];
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(candidateData)
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<void> {
    // First delete related votes
    await db.delete(votes).where(eq(votes.candidateId, id));
    // Then delete the candidate
    return await db.delete(candidates).where(eq(candidates.id, id));
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return db.select().from(candidates);
  }

  async getCandidatesByConstituency(constituency: string): Promise<Candidate[]> {
    return db
      .select()
      .from(candidates)
      .where(eq(candidates.constituency, constituency));
  }

  async getCandidatesCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(candidates);
    return result.count;
  }

  // Vote methods
  async recordVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async getVoteByVoterId(voterId: string): Promise<Vote | undefined> {
    const result = await db.select().from(votes).where(eq(votes.voterId, voterId));
    return result[0];
  }

  async getAllVotes(): Promise<Vote[]> {
    return db.select().from(votes);
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.id, id));
    return result[0];
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.username, username));
    return result[0];
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  // Results methods
  async getAllResults(): Promise<any[]> {
    // Get all votes
    const allVotes = await this.getAllVotes();
    const allCandidates = await this.getAllCandidates();
    const totalVotes = allVotes.length;

    // Count votes for each candidate
    const voteCounts = await db
      .select({
        candidateId: votes.candidateId,
        voteCount: count(),
      })
      .from(votes)
      .groupBy(votes.candidateId);

    // Create a map of candidate IDs to vote counts
    const voteCountMap = new Map(
      voteCounts.map(item => [item.candidateId, item.voteCount])
    );

    // Create results array with candidate details and vote counts
    const results = allCandidates.map(candidate => {
      const voteCount = voteCountMap.get(candidate.id) || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        partyName: candidate.partyName,
        partyShortName: candidate.partyShortName,
        partyColor: candidate.partyColor,
        constituency: candidate.constituency,
        voteCount,
        percentage: percentage.toFixed(1),
      };
    });

    // Sort by vote count in descending order
    return results.sort((a, b) => b.voteCount - a.voteCount);
  }

  async getResultsByConstituency(constituency: string): Promise<any[]> {
    const allResults = await this.getAllResults();
    return allResults.filter(result => result.constituency === constituency);
  }
}

export const storage = new DatabaseStorage();