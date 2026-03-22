require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { generateInvitationPDF } = require('./pdfGenerator');
const { sendInvitationEmail } = require('./mailer');
const { sendWhatsAppNotification } = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 5000;

/* ────────────────── Middleware ────────────────── */
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

/* ────────────────── MongoDB ────────────────── */
const MONGO_URI = process.env.MONGO_URI || '';

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅  MongoDB connected'))
    .catch((err) => console.error('❌  MongoDB connection error:', err.message));
} else {
  console.warn('⚠️  MONGO_URI not set — running without database');
}

/* ────────────────── Schema ────────────────── */
const invitationSchema = new mongoose.Schema(
  {
    guestName:      { type: String, required: true, trim: true },
    guestEmail:     { type: String, default: '', trim: true, lowercase: true },
    guestPhone:     { type: String, default: '', trim: true },
    signatureImage: { type: String },           // base64 PNG data-URL
    event:          { type: String, default: 'TechKruti 2025' },
    acceptedAt:     { type: Date, default: Date.now },
    emailSent:      { type: Boolean, default: false },
    whatsappSent:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);

/* ────────────────── POST /api/rsvp ────────────────── */
// This endpoint handles the full RSVP pipeline:
// 1. Save guest record to MongoDB Atlas
// 2. Generate a styled A4 invitation PDF with signature
// 3. Send the PDF as an email attachment
// 4. Send WhatsApp confirmation message
// 5. Return success to frontend
app.post('/api/rsvp', async (req, res) => {
  try {
    const { guestName, guestEmail, guestPhone, signatureImage, event, timestamp } = req.body;

    // Validation
    if (!guestName || guestName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Guest name is required (min 2 chars).' });
    }
    if (!guestEmail && !guestPhone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required.' });
    }

    // Save to DB (or proceed without DB)
    let savedInvitation = null;
    if (mongoose.connection.readyState === 1) {
      savedInvitation = await Invitation.create({
        guestName: guestName.trim(),
        guestEmail: guestEmail ? guestEmail.trim() : '',
        guestPhone: guestPhone ? guestPhone.trim() : '',
        signatureImage,
        event: event || 'TechKruti 2025',
        acceptedAt: timestamp ? new Date(timestamp) : new Date(),
      });
    }

    // Generate PDF
    let pdfBuffer = null;
    let pdfGenerated = false;
    try {
      pdfBuffer = await generateInvitationPDF({
        guestName: guestName.trim(),
        guestEmail: guestEmail || '',
        guestPhone: guestPhone || '',
        signatureImage,
        acceptedAt: timestamp || new Date().toISOString(),
      });
      pdfGenerated = true;
      console.log('📄  PDF generated successfully');
    } catch (pdfErr) {
      console.error('❌  PDF generation error:', pdfErr.message);
    }

    // Send Email
    let emailSent = false;
    if (guestEmail && pdfBuffer) {
      try {
        emailSent = await sendInvitationEmail(
          { guestName: guestName.trim(), guestEmail: guestEmail.trim() },
          pdfBuffer
        );
        console.log(emailSent ? '📧  Email sent' : '⚠️  Email sending returned false');
      } catch (emailErr) {
        console.error('❌  Email error:', emailErr.message);
      }
    }

    // Send WhatsApp
    let whatsappSent = false;
    if (guestPhone) {
      try {
        whatsappSent = await sendWhatsAppNotification({
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
        });
        console.log(whatsappSent ? '💬  WhatsApp sent' : '⚠️  WhatsApp sending returned false');
      } catch (waErr) {
        console.error('❌  WhatsApp error:', waErr.message);
      }
    }

    // Update DB flags
    if (savedInvitation) {
      await Invitation.findByIdAndUpdate(savedInvitation._id, { emailSent, whatsappSent });
    }

    return res.status(201).json({
      success: true,
      id: savedInvitation ? savedInvitation._id : null,
      emailSent,
      whatsappSent,
      pdfGenerated,
    });
  } catch (err) {
    console.error('❌  Server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/* ────────────────── GET /api/rsvp ────────────────── */
app.get('/api/rsvp', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }
    const invitations = await Invitation.find({})
      .select('-signatureImage')
      .sort({ acceptedAt: -1 });
    return res.json({ success: true, count: invitations.length, data: invitations });
  } catch (err) {
    console.error('❌  Fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/* ────────────────── GET /api/health ────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

/* ────────────────── Serve frontend ────────────────── */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

/* ────────────────── Start ────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀  TechKruti 2025 server running on http://localhost:${PORT}\n`);
});
