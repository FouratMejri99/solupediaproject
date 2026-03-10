// Node.js server with Nodemailer for sending emails
// ES Module version (compatible with "type": "module")

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "client/dist")));

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "weseily@gmail.com,info@solupedia.com"
).split(",");

// ---------------- ROUTES ----------------

// Send lead
app.post("/api/send-lead", async (req, res) => {
  try {
    const { name, email, company, service, message } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || '"Solupedia Website" <noreply@solupedia.com>',
      to: ADMIN_EMAILS,
      subject: `🚀 New Lead: ${name || email}`,
      html: `<h2>New Lead</h2>
             <p><strong>Name:</strong> ${name || "N/A"}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Company:</strong> ${company || "N/A"}</p>
             <p><strong>Service:</strong> ${service || "N/A"}</p>
             <p><strong>Message:</strong> ${message || "N/A"}</p>`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// Newsletter & Guide subscription
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const transporter = createTransporter();

    // Admin notification
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || '"Solupedia Website" <noreply@solupedia.com>',
      to: ADMIN_EMAILS,
      subject: `📧 New Subscriber: ${email}`,
      html: `<p>New subscriber: ${email}</p><p>Type: ${type || "newsletter"}</p>`,
    });

    // Handle guide_request type - send email with PDF attachment
    if (type === "guide_request") {
      const pdfPath = path.join(
        __dirname,
        "client/public/elearning_localization_guide.pdf"
      );

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Solupedia" <noreply@solupedia.com>',
        to: email,
        subject: "Your Free eLearning Localization Guide 📚",
        html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px; }
    .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Thank You for Your Interest!</h1>
    </div>
    <div class="content">
      <p>Dear Friend,</p>
      <p>Thank you for downloading our <strong>Ultimate Guide to eLearning Localization</strong>. We're excited to share our expertise with you!</p>
      <p>Inside this comprehensive guide, you'll discover:</p>
      <ul>
        <li>The fundamentals of eLearning localization</li>
        <li>Cultural adaptation strategies for educational content</li>
        <li>Best practices for multimedia localization</li>
        <li>Technical considerations for LMS integration</li>
        <li>Quality assurance processes for learning content</li>
      </ul>
      <p>The PDF guide is attached to this email. Simply download it to get started!</p>
      <p>If you have any questions about eLearning localization, feel free to reply to this email or visit our website.</p>
      <p>Best regards,<br/>The Solupedia Team</p>
    </div>
    <div class="footer">
      <p>© 2026 Solupedia LTD. All rights reserved.</p>
      <p>Industry Leaders in Learning Localization</p>
    </div>
  </div>
</body>
</html>`,
        attachments: [
          {
            filename: "elearning_localization_guide.pdf",
            path: pdfPath,
            contentType: "application/pdf",
          },
        ],
      });

      res.json({ success: true, message: "Guide sent successfully" });
      return;
    }

    // Default newsletter confirmation
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Solupedia" <noreply@solupedia.com>',
      to: email,
      subject: "Welcome to Solupedia 🎉",
      html: `<h2>Welcome!</h2><p>Thank you for subscribing to our newsletter.</p>`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
