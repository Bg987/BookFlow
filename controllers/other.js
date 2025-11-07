const Username = require("../models/username");
const Library = require("../models/Library");
const Librarian = require("../models/Librarian");
const LibraryRequest = require("../models/LibraryRequest");
const Member = require("../models/member");
const ActiveSession = require("../models/Active");
const { sendMail } = require("../config/mail");
const { resetPassEmail } = require("../utils/EmailsTemplate");
const runCleanupJob = require("../utils/cronJobs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateMembershipHTML }=require("../utils/EmailsTemplate");

const CRON_KEY = process.env.CRON_KEY || "my-secret-key";

exports.ForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body; // username or email
    if (!identifier) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const user = await Username.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.is_verified) {
      return res
        .status(403)
        .json({
          message:
            "Account not verified. Please verify your account using the link sent to your email.",
        });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    //token and expiration (15 minutes)
    user.tempToken = hashedToken;
    user.tokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    const rLink = `${process.env.FRONTEND_URL}/resetPass?token=${resetToken}`;
    const subject = "BookFlow Account Password Reset Link";
    console.log(resetPassEmail(rLink));
    //const temp = await sendMail(user.email, subject, resetPassEmail(rLink));
    //if (!temp) return res.status(500).json({ message: "error in email module" });
    res
      .status(200)
      .json({ message: "Password Reset Link Send to Email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body; //resettoken
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }
    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await Username.findOne({
      tempToken: hashedToken,
      tokenExpire: { $gt: Date.now() }, // Token not expired
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }//common validation 
    if (user.username === newPassword) {
      return res
        .status(400)
        .json({ message: "Username and password cannot be the same." });
    }//role specific validation\
    const modelMap = {
      library: Library,
      librarian: Librarian,
      member: Member,
    };
    const modelMap2 = {
      library: "lib_id",
      librarian: "librarian_id",
      member: "member_id",
    };
    const temp1 = {
      library: "library_name",
      librarian: "name",
      member : "name",
    };
    const temp = await modelMap[user.role].findOne({
      attributes: [temp1[user.role]],
      where: {
        [modelMap2[user.role]]: user.referenceId,
      },
    });

    if (temp && temp.dataValues[temp1[user.role]] === newPassword) {
      return res.status(400).json({
        message: "Name cannot match new password.",
      });
    }


    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset token fields4
    user.tempToken = undefined;
    user.tokenExpire = undefined;
    await user.save();
    res.status(200).json({
      message: `Password reset successful, Redirect to ${user.role} login`,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in ResetPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.cleanData = async (req, res) => {
  if (req.query.key !== CRON_KEY) {
    return res.status(403).send("Forbidden");
  }
  try {
    await runCleanupJob();
    res.send("Cleanup job executed successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Cleanup job failed.");
  }
}
exports.logout = async (req, res) => {
  const token = req.cookies?.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { id,role} = decoded;
  await ActiveSession.deleteOne({ id, role });
  if (global._io) {
    global._io.emit("activeUpdate", {
      id,
      action: "logout",
    });
  }
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.MODE !== "local", // HTTPS in prod
      sameSite: process.env.MODE !== "local" ? "None" : "Strict", // match original cookie
    });
    res.status(200).json({ message: "Logged out successfully" });
}
  
exports.getPendingRequests = async (req, res) => {
  try {
    const { library_id } = req.params;

    // Get all pending requests of this library
    const pendingRequests = await LibraryRequest.findAll({
      where: { library_id, status: "pending" },
      attributes: ["request_id", "member_id", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    if (!pendingRequests.length) {
      return res.status(200).json({
        success: true,
        message: "No pending membership requests found.",
        data: [],
      });
    }

    //Get all member IDs
    const memberIds = pendingRequests.map((req) => req.member_id);

    //Fetch all member data from SQL
    const members = await Member.findAll({
      where: { member_id: memberIds },
    });

    // Fetch all usernames from MongoDB where referenceId matches member_id
    const usernames = await Username.find({
      referenceId: { $in: memberIds },
    }).lean();

    // Step 5: Combine all data
    const result = pendingRequests.map((req) => {
      const member = members.find((m) => m.member_id === req.member_id);
      const user = usernames.find((u) => u.referenceId === req.member_id);

      return {
        request_id: req.request_id,
        member_id: req.member_id,
        requested_on: req.createdAt,
        member_name: member ? member.name : "N/A",
        member_city: member ? member.city : "N/A",
        member_dob: member ? member.dob : "N/A",
        email: user ? user.email : "N/A",
        username: user ? user.username : "N/A",
        profilePicUrl: user ? user.profilePicUrl : null,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending requests.",
      error: error.message,
    });
  }
};

exports.handleRequestAction = async (req, res) => {
  try {
    const { requestId, action, reason } = req.body; // action: "approve" | "reject"
    const actorId = req.user.referenceId; // library or librarian ID

    // Validate inputs
    if (!requestId || !action)
      return res.status(400).json({
        message: "Incomplete data: requestId and action are required",
      });

    if (!["approve", "reject"].includes(action))
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject'." });

    const request = await LibraryRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    //check whether member is exist or not whose this membership request
    const memberUser = await Username.findOne({
      referenceId: request.member_id,
    });
    if (!memberUser) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    const memberEmail = memberUser?.email || null;
    //console.log(memberEmail);

    // Librarian authorization check (belongs to same library)
    if (req.user.role === "librarian") {
      const librarian = await Librarian.findOne({
        attributes: ["lib_id"],
        where: { librarian_id: req.user.referenceId },
      });
      if (!librarian)
        return res.status(404).json({ message: "Librarian not found" });
      if (librarian.lib_id !== request.library_id)
        return res
          .status(403)
          .json({ message: "Unauthorized: You are not part of this library" });
    }

    //  Get library
    const library = await Library.findOne({
      where: { lib_id: request.library_id },
    });
    if (!library) return res.status(404).json({ message: "Library not found" });
    console.log(library.latitude);
    //  Reject must have reason
    if (action === "reject" && (!reason || reason.trim() === "")) {
      return res
        .status(400)
        .json({ message: "Reason is required when rejecting a request" });
    }

    //  Update request
    request.status = action === "approve" ? "approved" : "rejected";
    request.action_by = actorId;
    request.reason = reason;

    // Update library counters
    if (action === "approve") {
      library.total_members += 1;
      library.pending_requests -= 1;
    } else if (action === "reject") {
      library.rejected_requests += 1;
      library.pending_requests -= 1;
    }

    // Save both in parallel
    await Promise.all([request.save(), library.save()]);

    //  Real-time update via Socket.IO
    if (global._io) {
      global._io.to(request.library_id).emit("update-request-count", {
        total: library.total_members,
        pending: library.pending_requests,
        rejected: library.rejected_requests,
      });
    }
    res.status(200).json({
      success: true,
      message: `Request ${action}ed successfully`,
      updatedCounts: {
        total_members: library.total_members,
        pending_requests: library.pending_requests,
        rejected_requests: library.rejected_requests,
      },
    });
    // (async () => {
    //       const emailBody = generateMembershipHTML(
    //         library.library_name,
    //         library.latitude,
    //         library.longitude,
    //         action,
    //         reason
    //       );
    //     const subject = "Library Membership Response";
    //     console.log(emailBody);
    //     const resT = await sendMail(memberEmail, subject, emailBody);
    //     if (!resT) console.log("error in email");
    //     })();
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
