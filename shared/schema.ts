import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User/Voter Model
export const voters = pgTable("voters", {
  id: serial("id").primaryKey(),
  voterId: text("voter_id").notNull().unique(),
  password: text("password").notNull(), // DOB in DD/MM/YYYY format
  name: text("name").notNull(),
  dob: text("dob").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull(),
  gender: text("gender").notNull(),
  address: text("address").notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode").notNull(),
  maritalStatus: text("marital_status").notNull(),
  aadharNumber: text("aadhar_number").notNull().unique(),
  hasVoted: boolean("has_voted").default(false),
  constituency: text("constituency").notNull(),
});

export const insertVoterSchema = createInsertSchema(voters).pick({
  voterId: true,
  password: true,
  name: true,
  dob: true,
  age: true,
  email: true,
  gender: true,
  address: true,
  state: true,
  district: true,
  pincode: true,
  maritalStatus: true,
  aadharNumber: true,
  constituency: true,
});

// Candidate Model
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  partyName: text("party_name").notNull(),
  partyShortName: text("party_short_name").notNull(),
  partyColor: text("party_color").notNull(),
  constituency: text("constituency").notNull(),
  logoUrl: text("logo_url"),
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  partyName: true,
  partyShortName: true,
  partyColor: true,
  constituency: true,
  logoUrl: true,
});

// Vote Model (For blockchain simulation)
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  voterId: text("voter_id").notNull().unique(),
  candidateId: integer("candidate_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  transactionId: text("transaction_id").notNull().unique(),
  blockNumber: integer("block_number").notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  voterId: true,
  candidateId: true,
  transactionId: true,
  blockNumber: true,
});

// Admin Model
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
});

// Login Schema (for validation)
export const loginSchema = z.object({
  voterId: z.string().min(1, "Voter ID is required"),
  password: z.string().min(1, "Password is required")
    .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, "Password must be in DD/MM/YYYY format"),
});

// Export Types
export type Voter = typeof voters.$inferSelect;
export type InsertVoter = typeof voters.$inferInsert;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

export type Login = z.infer<typeof loginSchema>;
