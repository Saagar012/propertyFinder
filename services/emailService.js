const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
      auth: {
        user: process.env.EMAIL_SENDER || 'pfinder8848@gmail.com', // Use environment variable or fallback email
        pass: process.env.EMAIL_PASS || 'bpjr mijh euhi rcgp'
    }
});

exports.sendEmail = (name, email, phone, message, date, ownerEmail) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long', // Full month name
        day: '2-digit', // Day with leading zero
        year: 'numeric' // Full year
    }).format(new Date(date)); // Parse the date string
    
    
    const mailOptions = {
        from:process.env.EMAIL_SENDER, 
        to: ownerEmail, 
        subject: 'New Property Inquiry',
        text: `You have a new property inquiry from ${name}:
                        
                    Email: ${email}
                    Phone: ${phone}
                    Available Date: ${formattedDate}
                    Message: ${message}`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                reject(error); // Reject if email sending fails
            } else {
                console.log("Email sent successfully:", info.response);
                resolve(info); // Resolve with email info if successful
            }
        });
    });
};
