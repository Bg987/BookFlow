const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(
  "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");
// sgMail.setDataResidency('eu');
// uncomment the above line if you are sending mail using a regional EU subuser

const msg = {
  to: '220170116016@vgecg.ac.in', // Change to your recipient
  from: 'bhavyagodhaniya2004@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })


