const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ override: true });
console.log("env: ", JSON.stringify(process.env, null, 2))

  
  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your App Password
    },
  });
  
  // Example email sending function
  const sendEmail = async (to, subject, text) => {
    try {
      const mailOptions = {
        from: `"4Locos Padel" <${process.env.EMAIL}>`,
        to, // Recipient's email
        subject, // Email subject
        text, // Email body (plain text)
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
    }
  };
  

// Test sending email
sendEmail('michalfloch8@gmail.com', 'Test Email', 'This is a test email from my app.')
  .then(() => console.log('Email sent successfully'))
  .catch((error) => console.error('Failed to send email:', error));