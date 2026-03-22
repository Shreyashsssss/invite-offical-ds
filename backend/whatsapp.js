const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const COLLEGE = process.env.COLLEGE_NAME || 'XYZ College of Engineering & Technology';
const DATE = process.env.EVENT_DATE || '15-16 November 2025';
const VENUE = process.env.EVENT_VENUE || 'Main Auditorium, Block A';
const ORG_EMAIL = process.env.ORGANISER_EMAIL || 'techkruti@yourcollege.edu';

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'techkruti' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote'
        ]
    }
});

let isClientReady = false;

client.on('qr', (qr) => {
    console.log('\n📱 Scan the QR code below to authenticate WhatsApp Web Client:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Web Client is ready!');
    isClientReady = true;
});

client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp Client was logged out', reason);
    isClientReady = false;
});

client.initialize().catch(err => {
    console.error('❌ WhatsApp Client initialization error:', err.message);
    console.error('If you see a "browser is already running" error, please stop your server (Ctrl+C) and start it again.');
});

/**
 * Send WhatsApp notification via whatsapp-web.js
 * @param {{ guestName: string, guestPhone: string }} guest
 * @param {Buffer} [pdfBuffer]
 * @returns {Promise<boolean>}
 */
async function sendWhatsAppNotification(guest, pdfBuffer) {
  if (!isClientReady) {
    console.warn('⚠️ WhatsApp client is not ready yet. Skipping notification.');
    return false;
  }

  // Normalise phone number to remove common symbols
  let phone = guest.guestPhone.replace(/[\s\-\(\)]/g, '');
  
  // Format should be CountryCode + Number without + at the beginning for whatsapp-web.js
  if (phone.startsWith('+')) {
      phone = phone.substring(1);
  } else if (!phone.startsWith('91')) {
      // Assuming India as default if country code is missing and doesn't start with 91, normally length 10
      if (phone.length === 10) {
          phone = '91' + phone;
      }
  }

  const chatId = `${phone}@c.us`;

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
    if (pdfBuffer) {
        console.log(`📤 Sending PDF invitation to ${guest.guestName} (${phone})...`);
        
        // Save to a temporary file then create media - often more stable for large buffers in pptr
        const tempFilePath = path.join(__dirname, `invitation_${phone}.pdf`);
        fs.writeFileSync(tempFilePath, pdfBuffer);
        
        const media = MessageMedia.fromFilePath(tempFilePath);
        await client.sendMessage(chatId, media, { caption: body });
        
        // Clean up
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    } else {
        await client.sendMessage(chatId, body);
    }
    return true;
  } catch (err) {
    console.error('❌  WhatsApp error:', err.message);
    return false;
  }
}

// Graceful shutdown to close Chromium properly on nodemon restarts
process.on('SIGINT', async () => {
    console.log('\n(SIGINT) Shutting down WhatsApp client safely...');
    try {
        await client.destroy();
    } catch (e) {}
    process.exit(0);
});

module.exports = { sendWhatsAppNotification, whatsappClient: client };
