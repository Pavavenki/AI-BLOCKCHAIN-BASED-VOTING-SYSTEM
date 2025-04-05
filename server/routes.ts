import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { loginSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { blockchain } from "./blockchain";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "blockchain-voting-system-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: false, // set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "voterId",
        passwordField: "password",
      },
      async (voterId, password, done) => {
        try {
          const voter = await storage.getVoterByVoterId(voterId);
          
          if (!voter) {
            return done(null, false, { message: "Invalid voter ID" });
          }
          
          if (voter.password !== password) {
            return done(null, false, { message: "Invalid password" });
          }
          
          return done(null, voter);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    // Store type information to differentiate between voter and admin
    const isAdmin = !!user.username;
    done(null, { id: user.id, isAdmin });
  });

  passport.deserializeUser(async (serialized: { id: number, isAdmin: boolean }, done) => {
    try {
      const { id, isAdmin } = serialized;
      
      if (isAdmin) {
        // Deserialize admin user
        const admin = await storage.getAdmin(id);
        console.log("Deserialized admin user:", admin?.username);
        done(null, admin || null);
      } else {
        // Deserialize voter user
        const voter = await storage.getVoter(id);
        console.log("Deserialized voter user:", voter?.voterId);
        done(null, voter || null);
      }
    } catch (error) {
      console.error("Deserialize error:", error);
      done(error, null);
    }
  });

  // Admin strategy
  passport.use(
    'admin',
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const admin = await storage.getAdminByUsername(username);
          
          if (!admin) {
            return done(null, false, { message: "Invalid admin credentials" });
          }
          
          if (admin.password !== password) {
            return done(null, false, { message: "Invalid admin credentials" });
          }
          
          return done(null, admin);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    console.log("Admin check - User:", req.user);
    console.log("Admin check - Is authenticated:", req.isAuthenticated());
    
    if (req.isAuthenticated() && (req.user as any).username) {
      console.log("Admin authentication successful");
      return next();
    }
    
    console.log("Admin authentication failed");
    res.status(401).json({ message: "Unauthorized - Admin access required" });
  };

  // API routes
  app.post("/api/login", (req, res, next) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Invalid credentials" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ success: true, user: { id: user.id, voterId: user.voterId } });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.post("/api/admin/login", (req, res, next) => {
    console.log("Admin login attempt:", req.body);
    
    passport.authenticate("admin", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Admin auth error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Admin auth failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Invalid admin credentials" });
      }
      
      console.log("Admin authenticated successfully:", user.username);
      
      req.logIn(user, (err) => {
        if (err) {
          console.error("Admin session error:", err);
          return next(err);
        }
        console.log("Admin login complete, session established");
        return res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username,
            isAdmin: true 
          } 
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/voter", isAuthenticated, async (req, res) => {
    const voter = req.user;
    res.json(voter);
  });
  
  app.get("/api/admin/session", isAdmin, async (req, res) => {
    const admin = req.user;
    res.json(admin);
  });

  app.get("/api/voter/details", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const voter = await storage.getVoter(userId);
    
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }
    
    // Remove sensitive data
    const { password, ...voterDetails } = voter;
    res.json(voterDetails);
  });

  app.get("/api/candidates", isAuthenticated, async (req, res) => {
    const voter = req.user as any;
    if (!voter.constituency) {
      return res.status(400).json({ message: "Voter constituency not found" });
    }
    const candidates = await storage.getCandidatesByConstituency(voter.constituency);
    res.json(candidates);
  });

  app.post("/api/vote", isAuthenticated, async (req, res) => {
    const { candidateId } = req.body;
    const voter = req.user as any;
    
    if (!candidateId) {
      return res.status(400).json({ message: "Candidate selection is required" });
    }
    
    // Check if voter has already voted
    if (voter.hasVoted) {
      return res.status(400).json({ message: "You have already cast your vote" });
    }
    
    try {
      // Record vote in blockchain
      const blockchainData = blockchain.addVote(voter.voterId, candidateId);
      
      // Record vote in database
      await storage.recordVote({
        voterId: voter.voterId,
        candidateId,
        transactionId: blockchainData.transactionId,
        blockNumber: blockchainData.blockNumber,
      });
      
      // Update voter status
      await storage.updateVoterStatus(voter.id, true);
      
      res.json({
        success: true,
        transaction: blockchainData,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to record vote" });
    }
  });

  // Admin routes
  app.get("/api/admin/candidates", isAdmin, async (req, res) => {
    const candidates = await storage.getAllCandidates();
    res.json(candidates);
  });

  app.post("/api/admin/candidates", isAdmin, async (req, res) => {
    try {
      const candidate = await storage.createCandidate(req.body);
      res.status(201).json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create candidate" });
    }
  });

  app.put("/api/admin/candidates/:id", isAdmin, async (req, res) => {
    try {
      const candidate = await storage.updateCandidate(parseInt(req.params.id), req.body);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update candidate" });
    }
  });

  app.delete("/api/admin/candidates/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteCandidate(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete candidate" });
    }
  });

  app.get("/api/admin/voters", isAdmin, async (req, res) => {
    const voters = await storage.getAllVoters();
    // Remove sensitive data
    const votersWithoutPasswords = voters.map(voter => {
      const { password, ...voterData } = voter;
      return voterData;
    });
    res.json(votersWithoutPasswords);
  });

  app.post("/api/admin/voters", isAdmin, async (req, res) => {
    try {
      const voter = await storage.createVoter(req.body);
      const { password, ...voterData } = voter;
      res.status(201).json(voterData);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create voter" });
    }
  });

  app.put("/api/admin/voters/:id", isAdmin, async (req, res) => {
    try {
      const voter = await storage.updateVoter(parseInt(req.params.id), req.body);
      if (!voter) {
        return res.status(404).json({ message: "Voter not found" });
      }
      const { password, ...voterData } = voter;
      res.json(voterData);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update voter" });
    }
  });

  app.delete("/api/admin/voters/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteVoter(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete voter" });
    }
  });

  app.get("/api/admin/results", isAdmin, async (req, res) => {
    const { constituency } = req.query;
    let results;
    
    if (constituency && typeof constituency === 'string') {
      results = await storage.getResultsByConstituency(constituency);
    } else {
      results = await storage.getAllResults();
    }
    
    res.json(results);
  });

  // Create test data if needed (in development)
  if (process.env.NODE_ENV === 'development') {
    await createInitialData();
  }

  const httpServer = createServer(app);

  return httpServer;
}

async function createInitialData() {
  // Create admin if not exists
  const admin = await storage.getAdminByUsername('admin');
  if (!admin) {
    await storage.createAdmin({
      username: 'admin',
      password: 'admin123',
    });
  }

  // Create test voter if not exists
  const testVoter = await storage.getVoterByVoterId('VOT123456');
  if (!testVoter) {
    await storage.createVoter({
      voterId: 'VOT123456',
      password: '01/01/1990',
      name: 'John Doe',
      dob: '01/01/1990',
      age: 33,
      email: 'johndoe@example.com',
      gender: 'Male',
      address: '123 Main St, Apartment 4B',
      state: 'Karnataka',
      district: 'Bangalore',
      pincode: '560001',
      maritalStatus: 'Single',
      aadharNumber: 'XXXX-XXXX-1234',
      constituency: 'Bangalore Central',
    });
  }

  // Create test candidates if not exist
  const candidatesCount = await storage.getCandidatesCount();
  if (candidatesCount === 0) {
    await storage.createCandidate({
      name: 'Narendra Modi',
      partyName: 'Bharatiya Janata Party',
      partyShortName: 'BJP',
      partyColor: '#3366CC',
      constituency: 'Bangalore Central',
    });

    await storage.createCandidate({
      name: 'Rahul Gandhi',
      partyName: 'Indian National Congress',
      partyShortName: 'INC',
      partyColor: '#4CAF50',
      constituency: 'Bangalore Central',
    });

    await storage.createCandidate({
      name: 'Arvind Kejriwal',
      partyName: 'Aam Aadmi Party',
      partyShortName: 'AAP',
      partyColor: '#9C27B0',
      constituency: 'Bangalore Central',
    });

    await storage.createCandidate({
      name: 'None of the Above',
      partyName: 'NOTA',
      partyShortName: 'NOTA',
      partyColor: '#FF9800',
      constituency: 'Bangalore Central',
    });
  }
}
