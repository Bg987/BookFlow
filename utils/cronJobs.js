const { Op } = require("sequelize");
const mongoose = require("mongoose");
const Username = require("../models/username"); // Mongoose model
const Librarian = require("../models/Librarian"); // Sequelize model
const Library = require("../models/Library"); // Sequelize model
const { cloudinary } = require("../config/cloudinary");

console.log("Cron job module loaded");


async function runCleanupJob() {
    console.log("Running cleanup job...");

    try {
      const now = new Date();

      //  Find unverified & expired users
      const expiredUsers = await Username.find({
        is_verified: false,
        tokenExpire: { $lt: now },
      });

      // If no users found, return early
      if (!expiredUsers.length) {
        console.log("No unverified & expired users found. Skipping cleanup.");
        return;
      }

      //  Delete Cloudinary images
      for (let user of expiredUsers) {
        if (user.profilePicUrl) {
          try {
            const urlParts = user.profilePicUrl.split("/upload/");
            const pathWithVersion = urlParts[1];
            const publicId = pathWithVersion
              .replace(/^v\d+\//, "")
              .replace(/\.[^/.]+$/, "");
            await cloudinary.uploader.destroy(publicId);
            //console.log(`Deleted Cloudinary image: ${user.profilePicUrl}`);
          } catch (cloudErr) {
            console.error("Cloudinary delete error:", cloudErr.message);
          }
        }
      }

      //  Delete unverified & expired users from MongoDB
      const deletedUsers = await Username.deleteMany({
        is_verified: false,
        tokenExpire: { $lt: now },
      });
      console.log(
        `Deleted ${deletedUsers.deletedCount} unverified expired users from MongoDB`
      );

      //  Fetch valid referenceIds from remaining users
      const validRefs = await Username.find({}, "referenceId").lean();
      const refIds = validRefs.map((u) => u.referenceId);

      //  Delete orphaned librarians
      const deletedLibrarians = await Librarian.destroy({
        where: {
          librarian_id: { [Op.notIn]: refIds.length ? refIds : ["dummy"] },
        },
      });
      console.log(` Deleted ${deletedLibrarians} orphan librarians from SQL`);
      //  Delete orphaned libraries
      const deletedLibs = await Library.destroy({
        where: { lib_id: { [Op.notIn]: refIds.length ? refIds : ["dummy"] } },
      });
      console.log(` Deleted ${deletedLibs} orphan libraries from SQL`);

      console.log("Cleanup completed successfully.\n");
    } catch (error) {
      console.error(" Error during cleanup job:", error.message);
    }
}

module.exports = runCleanupJob;