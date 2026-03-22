const nodemailer = require('nodemailer');

const COLLEGE = process.env.COLLEGE_NAME || 'XYZ College of Engineering & Technology';
const DEPT = process.env.DEPT_NAME || 'Department of Computer Science & Engineering (Data Science)';
const DATE = process.env.EVENT_DATE || '15-16 November 2025';
const VENUE = process.env.EVENT_VENUE || 'Main Auditorium, Block A';
const ORG_EMAIL = process.env.ORGANISER_EMAIL || 'techkruti@yourcollege.edu';

/**
 * Send styled invitation email with PDF attachment.
 * @param {{ guestName: string, guestEmail: string }} guest
 * @param {Buffer} pdfBuffer
 * @returns {Promise<boolean>}
 */
async function sendInvitationEmail(guest, pdfBuffer) {
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('⚠️  Email credentials not set — skipping email.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#4a4a50;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#4a4a50;">
      <tr><td align="center" style="padding:40px 15px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#55525b;border:1px solid #777;border-radius:8px;overflow:hidden;color:#e0e0e0;">

          <!-- Header -->
          <tr><td style="padding:40px 40px 10px;text-align:center;">
            <div style="font-size:32px;font-weight:bold;color:#ff66cc;margin-bottom:8px;">Techkruti 2k26</div>
            <div style="font-size:14px;color:#a0a0a0;">National Level Tech Event · 24th & 25th March 2026</div>
            <div style="margin-top:24px;height:1px;background:#999;width:100%;"></div>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:20px 40px;">
            <div style="font-size:16px;margin-bottom:20px;line-height:1.6;color:#e0e0e0;">
              Dear <strong style="color:#ffffff;">${guest.guestName}</strong>,
            </div>
            <div style="font-size:16px;line-height:1.6;color:#c0c0c0;margin-bottom:30px;">
              Thank you for accepting your invitation to <strong style="color:#ffffff;">Techkruti 2k26</strong>! We are thrilled to have you join us for an incredible day of innovation, creativity, and competition.
            </div>

            <!-- Details Box -->
            <div style="background:#4b455c;border-left:4px solid #b366ff;border-radius:4px;padding:16px 20px;margin-bottom:30px;font-size:15px;line-height:1.8;color:#f0f0f0;">
              <div>📅 <strong style="color:#ff80df;">Date:</strong> 24th & 25th March 2026</div>
              <div>⏰ <strong style="color:#ff80df;">Time:</strong> 10:00 AM onwards</div>
              <div>📍 <strong style="color:#ff80df;">Venue:</strong> Central Library, TGPCET</div>
            </div>

            <div style="font-size:16px;line-height:1.6;color:#c0c0c0;margin-bottom:10px;">
              Your <strong style="color:#ffffff;">personalised signed invitation</strong> is attached as a PDF to this email.
            </div>
            <div style="font-size:16px;line-height:1.6;color:#c0c0c0;margin-bottom:30px;">
              Please download and keep it handy for the event.
            </div>

            <div style="font-size:15px;line-height:1.6;color:#a0a0a0;">
              We look forward to seeing you at <em>Krutiverse, KrutiArena, Vibe Coding, Open Mic & Treasure Hunt!</em> 🚀
            </div>
            
            <div style="margin-top:40px;height:1px;background:#999;width:100%;"></div>
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:10px 40px 40px;">
            <div style="text-align:center;font-size:13px;color:#999;line-height:1.6;">
              Tulsiramji Gaikwad-Patil College of Engineering & Technology<br>
              An Autonomous Institute | Affiliated to RTMNU, Nagpur
            </div>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;

  const safeName = guest.guestName.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');

  try {
    await transporter.sendMail({
      from: `"TechKruti 2025 🎉" <${EMAIL_USER}>`,
      to: guest.guestEmail,
      subject: `🎉 Your Signed Invitation – TechKruti 2025, ${COLLEGE}`,
      html,
      attachments: [
        {
          filename: `TechKruti_Invitation_${safeName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    return true;
  } catch (err) {
    console.error('❌  Mailer error:', err.message);
    return false;
  }
}

module.exports = { sendInvitationEmail };
