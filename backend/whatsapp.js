const COLLEGE = process.env.COLLEGE_NAME || 'XYZ College of Engineering & Technology';
const DATE = process.env.EVENT_DATE || '15-16 November 2025';
const VENUE = process.env.EVENT_VENUE || 'Main Auditorium, Block A';
const ORG_EMAIL = process.env.ORGANISER_EMAIL || 'techkruti@yourcollege.edu';

/**
 * Send WhatsApp notification via Twilio.
 * @param {{ guestName: string, guestPhone: string }} guest
 * @returns {Promise<boolean>}
 */
async function sendWhatsAppNotification(guest) {
  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_WHATSAPP_FROM;

  if (!SID || !TOKEN || !FROM) {
    console.warn('⚠️  Twilio credentials not set — skipping WhatsApp notification.');
    return false;
  }

  // Normalise phone number
  let phone = guest.guestPhone.replace(/[\s\-\(\)]/g, '');
  if (!phone.startsWith('+')) phone = '+' + phone;

  const body =
    `🎉 *TechKruti 2025 – Invitation Confirmed!*\n\n` +
    `Dear *${guest.guestName}*,\n` +
    `Your signed invitation for *TechKruti 2025* has been received!\n\n` +
    `📅 *Date:* ${DATE}\n` +
    `📍 *Venue:* ${VENUE}\n` +
    `🏛️ *Organised by:* CSE (Data Science) Dept.\n` +
    `🏫 *${COLLEGE}*\n\n` +
    `*Events at TechKruti:*\n` +
    `💻 Krutiverse (Hackathon)\n` +
    `🎮 KrutiArena (E-Sports)\n` +
    `⚡ Vibe Coding\n` +
    `🎤 Open Mic\n` +
    `🗺️ Treasure Hunt\n\n` +
    `Your personalised invitation PDF has been sent to your email.\n` +
    `We look forward to welcoming you! 🙏\n\n` +
    `For queries: ${ORG_EMAIL}`;

  try {
    const twilio = require('twilio');
    const client = twilio(SID, TOKEN);
    await client.messages.create({
      from: FROM,
      to: `whatsapp:${phone}`,
      body,
    });
    return true;
  } catch (err) {
    console.error('❌  WhatsApp error:', err.message);
    return false;
  }
}

module.exports = { sendWhatsAppNotification };
