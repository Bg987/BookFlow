// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(
//   ""
// );
// // sgMail.setDataResidency('eu');
// // uncomment the above line if you are sending mail using a regional EU subuser

// const msg = {
//   to: '220170116016@vgecg.ac.in', // Change to your recipient
//   from: 'bhavyagodhaniya2004@gmail.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })
// const { cloudinary } = require("./config/cloudinary");

// // Example URL
// const imageUrl =
//   "https://res.cloudinary.com/ddlyq5ies/image/upload/v1760984817/BookFlow/Profile_Pictures/librarians/librarian_07cde39c-fd1d-4389-b5b3-c2fc870dbec5.png";

// // Extract publicId
// const urlParts = imageUrl.split("/upload/");
// const pathWithVersion = urlParts[1];
// const publicId = pathWithVersion
//   .replace(/^v\d+\//, "")
//   .replace(/\.[^/.]+$/, "");

// (async () => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId);
//     console.log("Deleted Cloudinary image:", result);
//   } catch (error) {
//     console.error("Error deleting Cloudinary image:", error);
//   }
// })();
require("dotenv").config();

const { decryptId } = require("./utils/encryption")
const x =
  "dd23ae6a03520ba7d4758a7c069f289a:b5f2768a751cf7b9f68e8985248552aa243bc17f0b702d5526748b50bbd53f4e59301b8a14912724a906f346e3498809";
console.log(decryptId(x));