require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') || require('path').join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

/* ────────────────── Middleware ────────────────── */
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

/* ────────────────── Lazy load backend modules ────────────────── */
let sendInvitationEmail;

try {
  sendInvitationEmail = require('../backend/mailer');
} catch (err) {
  console.warn('⚠️  Email module failed to load:', err.message);
  // Provide fallback function
  sendInvitationEmail = async () => false;
}

/* ────────────────── MongoDB ────────────────── */
const MONGO_URI = process.env.MONGO_URI || '';
let mongoConnected = false;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI, { maxPoolSize: 1 })
    .then(() => {
      mongoConnected = true;
      console.log('✅  MongoDB connected');
    })
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
    signatureImage: { type: String },
    event:          { type: String, default: 'TechKruti 2025' },
    acceptedAt:     { type: Date, default: Date.now },
    emailSent:      { type: Boolean, default: false },
    whatsappSent:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);

/* ────────────────── POST /api/rsvp ────────────────── */
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
    if (mongoConnected && mongoose.connection.readyState === 1) {
      try {
        savedInvitation = await Invitation.create({
          guestName: guestName.trim(),
          guestEmail: guestEmail ? guestEmail.trim() : '',
          guestPhone: guestPhone ? guestPhone.trim() : '',
          signatureImage,
          event: event || 'TechKruti 2025',
          acceptedAt: timestamp ? new Date(timestamp) : new Date(),
        });
      } catch (dbErr) {
        console.error('⚠️  Database save error:', dbErr.message);
      }
    }

    // Send Email
    let emailSent = false;
    if (guestEmail && sendInvitationEmail) {
      try {
        emailSent = await sendInvitationEmail(
          { guestName: guestName.trim(), guestEmail: guestEmail.trim() },
          signatureImage
        );
        console.log(emailSent ? '📧  Email sent' : '⚠️  Email sending returned false');
      } catch (emailErr) {
        console.error('❌  Email error:', emailErr.message);
      }
    }

    // Update DB flags
    if (savedInvitation) {
      try {
        await Invitation.findByIdAndUpdate(savedInvitation._id, { emailSent, whatsappSent: false });
      } catch (updateErr) {
        console.error('⚠️  Database update error:', updateErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      id: savedInvitation ? savedInvitation._id : null,
      emailSent,
      whatsappSent: false,
      pdfGenerated: false,
      message: 'RSVP received successfully'
    });
  } catch (err) {
    console.error('❌  Server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/* ────────────────── GET /api/rsvp ────────────────── */
app.get('/api/rsvp', async (req, res) => {
  try {
    if (!mongoConnected || mongoose.connection.readyState !== 1) {
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
    mongo: mongoConnected ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

/* ────────────────── Serve frontend ────────────────── */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

module.exports = app;
