const User = require("../models/User");
const FreelancerProfile = require("../models/FreelancerProfile");

// @desc    Update current user profile info
// @route   PUT /api/users/me
exports.updateProfile = async (req, res) => {
  try {
    const { name, title, bio, skills, hourlyRate } = req.body;

    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    await user.save();

    if (user.role === "freelancer") {
      let profile = await FreelancerProfile.findOne({ user: user._id });
      if (!profile) {
        profile = new FreelancerProfile({ user: user._id });
      }

      if (title) profile.title = title;
      if (bio) profile.bio = bio;
      if (skills) profile.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
      if (hourlyRate) profile.hourlyRate = Number(hourlyRate);

      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
  }
};

// @desc    Update password
// @route   PUT /api/users/me/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, oldPassword, newPassword } = req.body;
    const pwdToMatch = currentPassword || oldPassword;

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.matchPassword(pwdToMatch))) {
      return res.status(400).json({ success: false, message: "Incorrect current password." });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update password." });
  }
};
