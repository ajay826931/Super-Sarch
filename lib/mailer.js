import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'khm_super_secret_jwt_key_2026';

function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

/**
 * Send 6-digit OTP to vendor email
 */
export async function sendOtpEmail(email, otp) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[KHM EMAIL SERVICE] SMTP credentials not set in .env.local.`);
    console.warn(`[DEVELOPMENT OTP] 🔑 OTP for ${email} is: ${otp}`);
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"Kota Hostel Management" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Login OTP for KHM Vendor Portal: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; rounded-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; margin-bottom: 8px;">KHM Vendor Portal</h2>
        <p style="color: #4b5563; font-size: 15px;">Use the following One-Time Password (OTP) to login to your dashboard:</p>
        <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This OTP is valid for 10 minutes. Please do not share this OTP with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px;">Kota Hostel Management &bull; Vendor Security System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, simulated: false };
}
