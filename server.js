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

// Newsletter
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

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
      html: `<p>New subscriber: ${email}</p>`,
    });

    // Confirmation email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Solupedia" <noreply@solupedia.com>',
      to: email,
      subject: "Welcome to Solupedia 🎉",
      html: `<h2>Welcome!</h2><p>Thank you for subscribing.</p>`,
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
