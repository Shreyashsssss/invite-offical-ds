const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Generate a styled TechKruti  2026 invitation PDF using custom image background.
 * @param {Object} data - { guestName, guestEmail, guestPhone, signatureImage, acceptedAt }
 * @returns {Promise<Buffer>}
 */
function generateInvitationPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = 595.28; // A4 width in points
      const H = 841.89; // A4 height in points

      /* ── 1. Draw Background Template Image ── */
      const templatePath = path.join(__dirname, 'template.png');
      const jpgPath = path.join(__dirname, 'template.jpg');

      let bgPath = null;
      if (fs.existsSync(templatePath)) bgPath = templatePath;
      else if (fs.existsSync(jpgPath)) bgPath = jpgPath;

      if (bgPath) {
        doc.image(bgPath, 0, 0, { width: W, height: H });
      } else {
        // Fallback if user hasn't saved template.png yet
        doc.rect(0, 0, W, H).fill('#ffffff');
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#ff0000');
        doc.text('WARNING: template.png not found in backend folder.', 50, 50);
      }

      /* ── 2. Add Guest Name (using matching script font) ── */
      const fontPath = path.join(__dirname, 'GreatVibes.ttf');
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        doc.font('Helvetica-Oblique');
      }

      // Purple colour matching the flyer's "Cordidal Invitation" text
      const purpleTint = '#60358f';
      const nameY = 650; // Position below the venue section

      doc.fontSize(45).fillColor(purpleTint);
      doc.text(data.guestName || 'Honoured Guest', 0, nameY, {
        align: 'center',
        width: W
      });

      /* ── 3. Add Guest Signature ── */
      const sigBoxW = 160;
      const sigBoxH = 80;
      const sigBoxX = (W - sigBoxW) / 2;
      const sigBoxY = nameY + 60;

      // Embed signature from the base64 canvas data URL
      if (data.signatureImage && data.signatureImage.length > 50) {
        try {
          // Strip "data:image/png;base64," prefix
          const base64 = data.signatureImage.replace(/^data:image\/\w+;base64,/, '');
          const sigBuf = Buffer.from(base64, 'base64');

          doc.image(sigBuf, sigBoxX, sigBoxY, {
            fit: [sigBoxW, sigBoxH],
            align: 'center',
            valign: 'center',
          });

          // Add a faint line under the signature
          doc.lineWidth(1).strokeColor('#888888');
          doc.moveTo(sigBoxX + 20, sigBoxY + sigBoxH - 10)
            .lineTo(sigBoxX + sigBoxW - 20, sigBoxY + sigBoxH - 10)
            .stroke();

          // Add faint "Signed" text
          doc.font('Helvetica').fontSize(10).fillColor('#888888');
          doc.text('Signature', 0, sigBoxY + sigBoxH - 5, { align: 'center', width: W });

        } catch (sigErr) {
          console.error('Failed to embed signature:', sigErr);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvitationPDF };
