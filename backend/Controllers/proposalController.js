const Proposal = require("../models/Proposal");
const Job = require("../models/Job");

// @desc    Submit proposal for a job
// @route   POST /api/jobs/:id/proposals
exports.createProposal = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { coverLetter, bidAmount, duration } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    // Check if freelancer already applied
    const existing = await Proposal.findOne({ job: jobId, freelancer: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already submitted a proposal for this job." });
    }

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: req.user.id,
      coverLetter,
      bidAmount,
      duration
    });

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully!",
      proposal
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to submit proposal." });
  }
};

// @desc    Get all proposals for a job (Job Owner Only)
// @route   GET /api/jobs/:id/proposals
exports.getJobProposals = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(200).json({ success: true, proposals: [] });
    }

    if (req.user.role !== "client") {
      return res.status(403).json({ success: false, message: "Only clients can view job proposals." });
    }

    const proposalsData = await Proposal.find({ job: jobId }).populate("freelancer", "name email");

    const proposals = proposalsData.map(p => ({
      id: p._id,
      jobId: p.job,
      freelancerId: p.freelancer ? p.freelancer._id : null,
      freelancerName: p.freelancer ? p.freelancer.name : "Freelancer",
      bidAmount: p.bidAmount,
      duration: p.duration,
      coverLetter: p.coverLetter,
      status: p.status === "accepted" ? "Accepted" : p.status === "rejected" ? "Rejected" : "Pending",
      submittedDate: p.createdAt.toISOString().split("T")[0]
    }));

    res.status(200).json({
      success: true,
      proposals
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch proposals." });
  }
};

// @desc    Update proposal status (Accept or Reject)
// @route   PUT /api/proposals/:id
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate("job");

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    // Verify job owner
    if (proposal.job.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update proposal status." });
    }

    const normalizedStatus = status.toLowerCase();
    proposal.status = normalizedStatus;
    await proposal.save();

    // If accepted, update job status to in_progress
    if (normalizedStatus === "accepted") {
      await Job.findByIdAndUpdate(proposal.job._id, { status: "in_progress" });
    }

    res.status(200).json({
      success: true,
      message: `Proposal status updated to ${normalizedStatus}`,
      proposal
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update proposal status." });
  }
};
