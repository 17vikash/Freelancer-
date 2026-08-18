const Review = require("../models/Review");
const Job = require("../models/Job");

// @desc    Post a review for completed job
// @route   POST /api/jobs/:id/reviews
exports.createReview = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { revieweeId, rating, comment } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (job.status !== "completed") {
      return res.status(400).json({ success: false, message: "Reviews can only be submitted after job status is completed." });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      reviewee: revieweeId,
      job: jobId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to submit review." });
  }
};
