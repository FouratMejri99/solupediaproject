import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "client/dist")));

// ---------------- EMAIL SETUP ----------------

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "weseily@gmail.com,info@solupedia.com"
).split(",");

// ---------------- EMAIL TEMPLATE ----------------

const guideEmailTemplate = () => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width"/>
<style>
body { background:#f3f4f6; font-family:Arial; margin:0; }
.container { max-width:600px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; }
.header { background:#3b82f6; color:#fff; padding:30px; text-align:center; }
.content { padding:25px; color:#333; }
.button {
  display:inline-block;
  padding:12px 20px;
  background:#3b82f6;
  color:white;
  border-radius:6px;
  text-decoration:none;
  margin-top:20px;
}
.footer { text-align:center; font-size:12px; padding:15px; color:#999; }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1>📘 Your Guide is Ready</h1>
  </div>

  <div class="content">
    <h2>Hello 👋</h2>

    <p>Thanks for requesting our guide.</p>

    <p><b>📥 The PDF is attached to this email.</b></p>

    <a href="https://solupedia.com/elearning_localization_guide.pdf" class="button">
      Download Guide
    </a>

    <p style="margin-top:20px;">— Solupedia Team</p>
  </div>

  <div class="footer">
    © 2026 Solupedia
  </div>
</div>

</body>
</html>
`;


// ---------------- ROUTES ----------------


app.post("/api/subscribe", async (req, res) => {
  try {
    const { email, name, company, type } = req.body;

    if (!email) {
      return res.status(400).json({ success: false });
    }

    // 📩 ADMIN EMAIL (only for guide request)
    if (type === "guide_request") {
      await transporter.sendMail({
        from: `"Solupedia" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAILS,
        subject: `📘 New Guide Request`,
        html: `
          <div style="font-family:Arial;background:#f9fafb;padding:20px;">
            <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:10px;">
              
              <h2>📘 New Guide Request</h2>

              <p><b>Name:</b> ${name || "N/A"}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Company:</b> ${company || "N/A"}</p>

            </div>
          </div>
        `,
      });
    }

    // 📘 GUIDE REQUEST → send PDF to user
    if (type === "guide_request") {
      const pdfPath = path.join(
        __dirname,
        "client",
        "public",
        "elearning_localization_guide.pdf"
      );

      console.log("PDF exists:", fs.existsSync(pdfPath));

      await transporter.sendMail({
        from: `"Solupedia" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Guide 📘",
        html: guideEmailTemplate(),
        attachments: [
          {
            filename: "elearning_localization_guide.pdf",
            path: pdfPath,
          },
        ],
      });

      return res.json({ success: true });
    }

    // 📬 NEWSLETTER (only if NOT guide)
    await transporter.sendMail({
      from: `"Solupedia" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome 🎉",
      html: `<h2>Welcome!</h2><p>Thanks for subscribing.</p>`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// 📧 SEND GUIDE
app.post("/api/send-guide", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false });
    }

    // 📁 Correct PDF path
    const pdfPath = path.join(
      __dirname,
      "client",
      "public",
      "elearning_localization_guide.pdf"
    );

    // 🧪 Debug check
    console.log("PDF exists:", fs.existsSync(pdfPath));
    console.log("PDF path:", pdfPath);

    await transporter.sendMail({
      from: `"Solupedia" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your eLearning Guide 📘",
      html: guideEmailTemplate(),

      attachments: [
        {
          filename: "elearning_localization_guide.pdf",
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    console.error("SEND GUIDE ERROR:", error);
    res.status(500).json({ success: false });
  }
});

// 📩 ADMIN TEST
app.post("/api/test-admin", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Solupedia" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAILS,
      subject: "Test Email",
      html: "<h2>It works ✅</h2>",
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});