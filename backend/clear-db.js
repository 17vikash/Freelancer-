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
const Review = require("./models/Review");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freelancer_marketplace";

async function clearDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    // Delete everything
    await User.deleteMany({});
    await FreelancerProfile.deleteMany({});
    await Job.deleteMany({});
    await Proposal.deleteMany({});
    await Review.deleteMany({});

    console.log("SUCCESS: MongoDB Atlas database wiped 100% CLEAN! 0 Users, 0 Jobs, 0 Proposals.");
    process.exit(0);
  } catch (err) {
    console.error("Database wipe error:", err);
    process.exit(1);
  }
}

clearDatabase();
