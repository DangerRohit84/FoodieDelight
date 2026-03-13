const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.warn('⚠️ WARNING: SMTP_EMAIL or SMTP_PASSWORD is not set in environment variables! Email sending will likely fail in this production environment.');
    }

    // Create reusable transporter object using explicit SMTP settings for production reliability
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Support HTML emails
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
