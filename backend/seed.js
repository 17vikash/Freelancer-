const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const User = require("./models/User");
const FreelancerProfile = require("./models/FreelancerProfile");
const Job = require("./models/Job");
const Proposal = require("./models/Proposal");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freelancer_marketplace";

async function seedData() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas successfully!");

    // Clear existing
    await User.deleteMany();
    await FreelancerProfile.deleteMany();
    await Job.deleteMany();
    await Proposal.deleteMany();

    // Create Client User
    const client = await User.create({
      name: "Apex Financial Labs",
      email: "client@freelancer.com",
      password: "password123",
      role: "client"
    });

    // Create Freelancer User
    const freelancer = await User.create({
      name: "Alex Rivera",
      email: "freelancer@freelancer.com",
      password: "password123",
      role: "freelancer"
    });

    // Create Freelancer Profile
    await FreelancerProfile.create({
      user: freelancer._id,
      title: "Senior Full-Stack Developer & UI/UX Architect",
      bio: "Passionate full-stack developer with 7+ years of experience crafting high-performance web applications and mobile UI/UX.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "TailwindCSS"],
      hourlyRate: 1500,
      portfolio: [
        { title: "Apex Fintech Dashboard", image: "https://picsum.photos/seed/fintech/600/400", link: "#" },
        { title: "Crypto Tracker Mobile App", image: "https://picsum.photos/seed/crypto/600/400", link: "#" }
      ]
    });

    // Create Sample Jobs
    const job1 = await Job.create({
      client: client._id,
      title: "Build High-Conversion Fintech SaaS Dashboard in React & Node",
      description: "Looking for an experienced full-stack engineer to build a modern analytics dashboard for a fintech application. Must include dark mode, charts, export capabilities, and real-time WebSockets integration.",
      category: "Web Development",
      budgetType: "fixed",
      budgetAmount: 65000,
      skills: ["React", "Node.js", "TypeScript", "TailwindCSS"],
      deadline: "2026-08-25",
      status: "open"
    });

    const job2 = await Job.create({
      client: client._id,
      title: "iOS Native App UI/UX Redesign in SwiftUI & Figma",
      description: "Redesign 12 core screens for our logistics mobile app. Clean glassmorphism layout, subtle micro-interactions, smooth animations, and full accessibility support.",
      category: "Mobile Apps",
      budgetType: "hourly",
      budgetAmount: 1800,
      skills: ["Figma", "SwiftUI", "iOS Design"],
      deadline: "2026-08-30",
      status: "open"
    });

    // Create Proposal
    await Proposal.create({
      job: job1._id,
      freelancer: freelancer._id,
      coverLetter: "I have 6+ years building fintech dashboards with React & Node. I can deliver pixel-perfect designs with real-time chart integration within 2 weeks.",
      bidAmount: 62000,
      duration: "14 days",
      status: "pending"
    });

    console.log("Database seeded successfully!");
    console.log("Client login: client@freelancer.com / password123");
    console.log("Freelancer login: freelancer@freelancer.com / password123");
    process.exit(0);

  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();
