// Node.js server with Nodemailer for sending emails
// Deploy this alongside your frontend on Hostinger

require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the client build (for production)
app.use(express.static(path.join(__dirname, "client/dist")));

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Admin emails
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "weseily@gmail.com,info@solupedia.com"
).split(",");

// Email templates
const getLeadEmailHtml = data => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0;">🚀 New Lead Received!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
    <h2 style="margin-top: 0;">Lead Details</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.name || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.email}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.company || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.service || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Message:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.message || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Submitted:</td>
        <td style="padding: 10px 0;">${new Date().toLocaleString()}</td>
      </tr>
    </table>
  </div>
  
  <p style="color: #666; font-size: 12px; margin-top: 20px;">
    This email was sent from your Solupedia website contact form.
  </p>
</body>
</html>
`;

const getNewsletterEmailHtml = (email, type) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0;">📧 New Newsletter Subscriber!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
    <h2 style="margin-top: 0;">Subscription Details</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Subscribed:</strong> ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
`;

const getConfirmationEmailHtml = type => {
  const messages = {
    newsletter: {
      title: "Welcome to Our Newsletter! 🎉",
      content:
        "Thank you for subscribing to our newsletter. You will now receive the latest updates, news, and exclusive content directly in your inbox.",
    },
    lead: {
      title: "Thank You for Your Interest! 📬",
      content:
        "We have received your message and will get back to you within 24-48 hours. In the meantime, feel free to browse our services.",
    },
    quote_request: {
      title: "Quote Request Received! 📋",
      content:
        "We have received your quote request and are preparing a customized proposal for you. Our team will contact you shortly.",
    },
    guide_request: {
      title: "Your Guide is Ready! 📚",
      content:
        "Thank you for your interest! Your free guide should arrive in your inbox shortly. Please check your spam folder if you don't receive it within a few minutes.",
    },
  };

  const msg = messages[type] || messages.newsletter;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0;">${msg.title}</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
    <p>${msg.content}</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    
    <h3>Why You'll Love Our Content:</h3>
    <ul>
      <li>📈 Industry insights and trends</li>
      <li>💡 Tips and best practices</li>
      <li>🎯 Exclusive offers and updates</li>
    </ul>
  </div>
  
  <p style="color: #666; font-size: 12px; margin-top: 20px;">
    Best regards,<br>
    The Solupedia Team<br>
    <a href="https://solupedia.com" style="color: #667eea;">https://solupedia.com</a>
  </p>
</body>
</html>
  `;
};

// API Routes

// Send lead notification to admins
app.post("/api/send-lead", async (req, res) => {
  try {
    const { name, email, company, service, message } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const transporter = createTransporter();

    // Send to all admins
    const mailOptions = {
      from:
        process.env.SMTP_FROM || '"Solupedia Website" <noreply@solupedia.com>',
      to: ADMIN_EMAILS,
      subject: `🚀 New Lead: ${name || email} - ${service || "General Inquiry"}`,
      html: getLeadEmailHtml({ name, email, company, service, message }),
    };

    await transporter.sendMail(mailOptions);

    console.log("Lead notification sent to admins:", ADMIN_EMAILS);
    res.json({ success: true, message: "Lead notification sent" });
  } catch (error) {
    console.error("Error sending lead email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Send newsletter subscription to admins
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email, type = "newsletter" } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const transporter = createTransporter();

    // Send notification to admins
    const adminMailOptions = {
      from:
        process.env.SMTP_FROM || '"Solupedia Website" <noreply@solupedia.com>',
      to: ADMIN_EMAILS,
      subject: `📧 New Newsletter Subscriber: ${email}`,
      html: getNewsletterEmailHtml(email, type),
    };

    await transporter.sendMail(adminMailOptions);

    // Send confirmation to subscriber
    const confirmationOptions = {
      from: process.env.SMTP_FROM || '"Solupedia" <noreply@solupedia.com>',
      to: email,
      subject: "Welcome to Solupedia! 🎉",
      html: getConfirmationEmailHtml(type),
    };

    await transporter.sendMail(confirmationOptions);

    console.log("Newsletter subscription processed for:", email);
    res.json({ success: true, message: "Subscription successful" });
  } catch (error) {
    console.error("Error processing subscription:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process subscription" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all for SPA routing (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
