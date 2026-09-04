const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,  // 10s — fail fast if SMTP unreachable
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const emailService = {
  /**
   * Send a password reset email with a token link.
   */
  async sendPasswordResetEmail(toEmail, firstName, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"FixIt Support" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '🔐 Reset Your FixIt Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Your Password</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:32px;text-align:center;">
                      <div style="font-size:32px;margin-bottom:8px;">🔧</div>
                      <div style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">FixIt</div>
                      <div style="color:#bfdbfe;font-size:13px;margin-top:4px;">Home Services Platform</div>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:36px 32px;">
                      <h2 style="color:#f1f5f9;font-size:20px;font-weight:700;margin:0 0 12px;">Hi ${firstName},</h2>
                      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
                        We received a request to reset your FixIt account password. Click the button below to create a new password.
                        This link is valid for <strong style="color:#60a5fa;">15 minutes</strong>.
                      </p>
                      <div style="text-align:center;margin:32px 0;">
                        <a href="${resetUrl}" 
                           style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                          Reset My Password
                        </a>
                      </div>
                      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:24px 0 0;">
                        If you didn't request a password reset, please ignore this email — your password will remain unchanged and this link will expire automatically.<br /><br />
                        For security, this link can only be used once.
                      </p>
                      <hr style="border:none;border-top:1px solid #334155;margin:28px 0;" />
                      <p style="color:#475569;font-size:11px;line-height:1.6;margin:0;">
                        Can't click the button? Copy and paste this URL into your browser:<br />
                        <span style="color:#60a5fa;word-break:break-all;">${resetUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 32px;background-color:#0f172a;border-top:1px solid #1e293b;text-align:center;">
                      <p style="color:#475569;font-size:11px;margin:0;">
                        © ${new Date().getFullYear()} FixIt. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info('Password reset email sent', { to: toEmail, messageId: info.messageId });
      return info;
    } catch (error) {
      logger.error('Failed to send password reset email', { to: toEmail, error: error.message });
      throw error;
    }
  },
};

module.exports = emailService;
