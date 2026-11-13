
require("dotenv").config();

const sendEmail = require("./config/email");

const testEmail = async () => {
    try {
        await sendEmail({
            to: process.env.EMAIL_USER,
            subject: "TaskFlow Email Test",
            html: `
                <h2>Welcome to TaskFlow!</h2>
                <p>Your email notification system is working successfully.</p>
                <p>This is a test email from TaskFlow.</p>
            `
        });

        console.log("Test email sent successfully!");
    } catch (error) {
        console.error("Test failed:", error.message);
    }
};

testEmail();
