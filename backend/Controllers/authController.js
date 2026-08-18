const jwt = require("jsonwebtoken");
const User = require("../models/User");
const FreelancerProfile = require("../models/FreelancerProfile");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "gigora_freelancer_marketplace_jwt_secret_key_2026", {
    expiresIn: process.env.JWT_EXPIRE || "30d"
  });
};

// Generate 6-digit random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user & send Email OTP
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    let { name, email, password, role, title, hourlyRate, skills } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Password)."
      });
    }

    email = email.toLowerCase().trim();

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Security Policy: Password must be at least 8 characters long."
      });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "An account with this email address already exists. Please log in."
        });
      } else {
        // User previously initiated signup but never verified OTP. Update details and send fresh OTP.
        existingUser.name = name;
        existingUser.password = password; // Hashed automatically on save
        existingUser.role = role || "client";
        existingUser.otpCode = otpCode;
        existingUser.otpExpires = otpExpires;
        await existingUser.save();

        await sendEmail({
          email: existingUser.email,
          subject: "Verify Your Email — Freelancer Marketplace",
          otp: otpCode,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F8FAFC;">
              <h2 style="color: #3B34D6;">Welcome to Freelancer Marketplace</h2>
              <p>Hi ${existingUser.name},</p>
              <p>Your email verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #14162B; padding: 16px; background: #FFFFFF; border: 1px solid #E2E8F0; display: inline-block; border-radius: 8px; margin: 12px 0;">
                ${otpCode}
              </div>
              <p style="color: #64748B; font-size: 14px;">This OTP is valid for 15 minutes.</p>
            </div>
          `
        });

        return res.status(200).json({
          success: true,
          isVerified: false,
          email: existingUser.email,
          message: `Fresh verification code sent to ${existingUser.email}. Please enter the 6-digit OTP to complete registration.`
        });
      }
    }

    // Create New User (Unverified until OTP verified)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "client",
      isVerified: false,
      otpCode,
      otpExpires
    });

    // If freelancer role, create profile
    if (role === "freelancer") {
      await FreelancerProfile.create({
        user: user._id,
        title: title || "Senior Full-Stack Developer",
        hourlyRate: hourlyRate || 1200,
        skills: skills || ["React", "Node.js"]
      });
    }

    // Dispatch Email OTP
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email — Freelancer Marketplace",
      otp: otpCode,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F8FAFC;">
          <h2 style="color: #3B34D6;">Welcome to Freelancer Marketplace</h2>
          <p>Hi ${user.name},</p>
          <p>Your email verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #14162B; padding: 16px; background: #FFFFFF; border: 1px solid #E2E8F0; display: inline-block; border-radius: 8px; margin: 12px 0;">
            ${otpCode}
          </div>
          <p style="color: #64748B; font-size: 14px;">This OTP is valid for 15 minutes. Do not share this code with anyone.</p>
        </div>
      `
    });

    res.status(201).json({
      success: true,
      isVerified: false,
      email: user.email,
      message: `Verification code sent to ${user.email}. Please enter the 6-digit OTP sent to your email to complete registration.`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create user account."
    });
  }
};

// @desc    Verify 6-Digit Email OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address and 6-digit OTP code are required."
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+otpCode +otpExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: "Account is already verified.",
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // Verify OTP code and expiration
    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code (OTP). Please check and try again."
      });
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new OTP."
      });
    }

    // Mark user as verified & clear OTP
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Freelancer Marketplace.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to verify email."
    });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required."
      });
    }

    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    const otpCode = generateOTP();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "New Verification Code — Freelancer Marketplace",
      otp: otpCode,
      html: `<p>Your new verification code is <b>${otpCode}</b> (Valid 15 mins).</p>`
    });

    res.status(200).json({
      success: true,
      message: `Fresh verification code sent to ${user.email}.`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to resend verification code."
    });
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password."
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email and password."
      });
    }

    // Enforce Email Verification Check
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isVerified: false,
        email: user.email,
        message: "Email address not verified yet. Please enter the verification OTP sent to your email."
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to log in."
    });
  }
};

// @desc    Get logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch user data."
    });
  }
};

// @desc    Google OAuth Sign In (Auto-Verified)
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, role } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        password: "google_oauth_user_secret_" + Date.now(),
        role: role || (email.includes("alex") ? "freelancer" : "client"),
        isVerified: true // Google accounts pre-verified by Google
      });

      if (user.role === "freelancer") {
        await FreelancerProfile.create({
          user: user._id,
          title: "Senior Full-Stack Developer",
          hourlyRate: 1500
        });
      }
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Google authentication failed."
    });
  }
};
