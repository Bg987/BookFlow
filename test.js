const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
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