import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

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

// ---------------- API HANDLER ----------------

export async function POST(req: Request) {
  try {
    const { email, name, company, type } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // 📩 ADMIN EMAIL (only for guide request)
    if (type === "guide_request") {
      await transporter.sendMail({
        from: `"Solupedia" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAILS,
        subject: "📘 New Guide Request",
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

    // 📘 GUIDE REQUEST → send PDF
    if (type === "guide_request") {
      // IMPORTANT: In Next.js, use process.cwd()
      const pdfPath = path.join(
        process.cwd(),
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

      return NextResponse.json({ success: true });
    }

    // 📬 NEWSLETTER
    await transporter.sendMail({
      from: `"Solupedia" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome 🎉",
      html: `<h2>Welcome!</h2><p>Thanks for subscribing.</p>`,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}