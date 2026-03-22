const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Generate a styled TechKruti 2026 invitation PDF using HTML template.
 * @param {Object} data - { guestName, guestEmail, guestPhone, signatureImage, acceptedAt }
 * @returns {Promise<Buffer>}
 */
async function generateInvitationPDF(data) {
  let sigImgHtml = '<span class="sig-arrow">⟿</span>';
  if (data.signatureImage && data.signatureImage.length > 50) {
    sigImgHtml = `<img src="${data.signatureImage}" style="height: 60px; object-fit: contain; margin-bottom: 5px; display: block; margin: 0 auto;" />`;
  }

  const logoPath = path.join(__dirname, 'logo.png');
  let logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  if (fs.existsSync(logoPath)) {
    const ext = path.extname(logoPath).replace('.', '') || 'png';
    logoBase64 = `data:image/${ext};base64,${fs.readFileSync(logoPath).toString('base64')}`;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Techkruti 2k26 \u2013 Cordial Invitation</title>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@700&family=Raleway:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #c8b8dc;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: Raleway, sans-serif;
    padding: 20px;
  }

  .card {
    width: 680px;
    background: #f7f0fa;
    position: relative;
    overflow: hidden;
    border: 2.5px solid #8040a0;
    box-shadow: 0 10px 60px rgba(80,30,120,0.3);
  }

  /* ---- WATERCOLOR BG ---- */
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 380px 300px at 8% 72%, rgba(140,180,215,0.45) 0%, transparent 65%),
      radial-gradient(ellipse 260px 200px at 12% 92%, rgba(160,195,225,0.35) 0%, transparent 65%),
      radial-gradient(ellipse 220px 180px at 90% 6%,  rgba(195,155,220,0.30) 0%, transparent 65%),
      radial-gradient(ellipse 340px 240px at 82% 18%, rgba(210,175,235,0.22) 0%, transparent 65%),
      radial-gradient(ellipse 500px 320px at 50% 50%, rgba(228,208,242,0.28) 0%, transparent 78%);
    pointer-events: none;
    z-index: 0;
  }

  /* ---- TOP-RIGHT FLOWER CLUSTER ---- */
  .flower-tr {
    position: absolute;
    top: 0; right: 0;
    width: 200px; height: 210px;
    z-index: 1;
    pointer-events: none;
  }
  .flower-tr::before {
    content: "";
    position: absolute;
    top: -15px; right: -15px;
    width: 190px; height: 190px;
    background: radial-gradient(ellipse at 55% 35%, #9060b8 0%, #c090d8 30%, #ddc0ec 55%, transparent 75%);
    border-radius: 45% 30% 55% 40%;
    opacity: 0.9;
  }
  .flower-tr::after {
    content: "";
    position: absolute;
    top: 25px; right: 10px;
    width: 110px; height: 110px;
    background: radial-gradient(ellipse at 50% 40%, #6030a0 0%, #a070c8 45%, transparent 75%);
    border-radius: 38% 62% 50% 48%;
    opacity: 0.75;
  }
  .flower-petal {
    position: absolute;
    top: 5px; right: 50px;
    width: 70px; height: 90px;
    background: radial-gradient(ellipse at 50% 50%, #b890d0 0%, #d8b8e8 50%, transparent 80%);
    border-radius: 50% 40% 60% 50%;
    opacity: 0.6;
    transform: rotate(-30deg);
  }

  /* ---- BOTTOM-LEFT LEAF/FLORAL ---- */
  .leaf-bl {
    position: absolute;
    bottom: 30px; left: -25px;
    width: 250px; height: 280px;
    z-index: 1;
    pointer-events: none;
  }
  .leaf-bl::before {
    content: "";
    position: absolute;
    width: 180px; height: 220px;
    background: radial-gradient(ellipse at 45% 55%, rgba(120,165,205,0.55) 0%, rgba(145,185,215,0.35) 45%, transparent 70%);
    border-radius: 55% 42% 35% 65%;
    top: 20px; left: 10px;
  }
  .leaf-bl::after {
    content: "";
    position: absolute;
    width: 130px; height: 160px;
    background: radial-gradient(ellipse at 50% 50%, rgba(160,195,225,0.55) 0%, rgba(185,210,230,0.3) 55%, transparent 75%);
    border-radius: 48% 58% 42% 52%;
    top: 50px; left: 40px;
    transform: rotate(15deg);
  }
  .leaf-stem {
    position: absolute;
    bottom: 0; left: 80px;
    width: 3px; height: 120px;
    background: linear-gradient(to top, rgba(100,150,180,0.5), transparent);
    border-radius: 3px;
  }

  /* ---- STARS ---- */
  .star { position: absolute; color: #7030a0; z-index: 2; pointer-events: none; opacity: 0.45; }

  /* ---- SWIRL LINE RIGHT ---- */
  .swirl-r {
    position: absolute;
    right: 14px; top: 220px;
    width: 50px; height: 340px;
    border-right: 1.5px solid rgba(110,60,150,0.28);
    border-radius: 0 70px 70px 0;
    z-index: 2;
    pointer-events: none;
  }

  /* ---- ALL CONTENT ---- */
  .inner {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ---- LOGO BAR ---- */
  .logo-bar {
    width: 100%;
    background: white;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 2px solid #e0d0ec;
  }
  .tgp-logo-img {
    width: 48px; height: 48px;
    object-fit: contain;
    flex-shrink: 0;
  }
  .logo-text-block {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }
  .dte-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #555;
  }
  .college-name-line {
    font-weight: 800;
    font-size: 14.5px;
    color: #1a2e80;
    letter-spacing: 0.4px;
    line-height: 1.15;
    text-transform: uppercase;
  }
  .college-sub {
    font-size: 12px;
    font-weight: 600;
    color: #2244bb;
  }
  .college-approved {
    font-size: 7.5px;
    color: #888;
    margin-top: 1px;
  }
  .college-auto {
    font-size: 9px;
    color: #cc2200;
    font-weight: 700;
    letter-spacing: 1px;
    margin-top: 1px;
  }
  .logo-right-block {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .nbr-badge {
    width: 32px; height: 32px;
    background: conic-gradient(#2244bb 0deg, #4466dd 360deg);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 9px; font-weight: 800;
    flex-shrink: 0;
  }
  .idea-badge {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #f0a000, #e06000);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 8px; font-weight: 800;
    flex-shrink: 0;
  }
  .gp-divider {
    width: 1.5px; height: 36px;
    background: #ccc;
  }
  .gp-block {
    display: flex; align-items: center; gap: 6px;
  }
  .g-box {
    width: 28px; height: 28px;
    background: #1a2e80;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 900; font-size: 15px;
  }
  .gp-text { display: flex; flex-direction: column; }
  .gp-name { font-weight: 800; font-size: 11px; color: #1a2e80; }
  .gp-sub  { font-size: 8.5px; color: #666; }

  /* ---- BODY CONTENT ---- */
  .content-body {
    padding: 24px 44px 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* ---- CORDIAL INVITATION ---- */
  .title-cordial {
    font-family: "Great Vibes", cursive;
    font-size: 70px;
    color: #6828a0;
    text-align: center;
    line-height: 1;
    margin-bottom: 2px;
    text-shadow: 2px 3px 8px rgba(100,40,160,0.12);
    width: 100%;
  }
  .title-to {
    font-family: "Dancing Script", cursive;
    font-size: 30px;
    color: #502088;
    text-align: center;
    margin-bottom: 6px;
  }
  .title-main {
    font-family: "Dancing Script", cursive;
    font-size: 86px;
    color: #28104a;
    text-align: center;
    line-height: 1;
    margin-bottom: 6px;
    letter-spacing: -1px;
    text-shadow: 2px 4px 10px rgba(40,16,74,0.14);
    width: 100%;
  }

  /* ---- ORNAMENT ---- */
  .ornament {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; margin: 12px 0; width: 100%;
  }
  .orn-line {
    flex: 1; height: 1.5px;
    background: linear-gradient(to right, transparent, #8040a8, transparent);
  }
  .orn-mid { color: #8040a8; font-size: 20px; }
  .orn-arr { color: #8040a8; font-size: 13px; }

  /* ---- DATE TIME ---- */
  .date-block { text-align: center; margin: 4px 0 2px; }
  .date-text {
    font-family: Raleway, sans-serif;
    font-size: 21px; font-weight: 700; color: #28104a; margin-bottom: 3px;
  }
  .date-text sup { font-size: 12px; }
  .time-text {
    font-family: Raleway, sans-serif;
    font-size: 20px; font-weight: 700; color: #28104a;
  }

  /* ---- EVENT INFO ---- */
  .event-block { text-align: center; margin: 4px 0; }
  .ev-line {
    font-family: Raleway, sans-serif;
    font-size: 19px; font-weight: 700; color: #28104a; margin-bottom: 2px;
  }

  /* ---- GUEST NAME ---- */
  .guest-wrap {
    margin-top: 16px;
    margin-bottom: 6px;
    width: 100%;
    text-align: center;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .guest-name {
    font-family: "Great Vibes", cursive;
    font-size: 54px;
    color: #4a1878;
    line-height: 1.15;
    text-shadow: 1px 2px 5px rgba(74,24,120,0.1);
    display: inline-block;
    max-width: 100%;
  }

  /* ---- SIGNATURE ---- */
  .sig-block { text-align: center; margin-top: 10px; }
  .sig-arrow { font-size: 30px; color: #b8900a; letter-spacing: -3px; display: block; }
  .sig-label { font-size: 12px; color: #999; letter-spacing: 1px; margin-top: 2px; }

</style>
</head>
<body>

<div class="card">
  <div class="flower-tr"><div class="flower-petal"></div></div>
  <div class="leaf-bl"><div class="leaf-stem"></div></div>
  <div class="swirl-r"></div>
  <span class="star" style="font-size:13px;top:195px;right:28px;">★</span>
  <span class="star" style="font-size:11px;top:330px;right:14px;">✦</span>
  <span class="star" style="font-size:13px;top:510px;right:20px;">★</span>
  <span class="star" style="font-size:10px;top:680px;right:10px;">✦</span>
  <span class="star" style="font-size:10px;top:175px;left:16px;opacity:0.25;">✦</span>

  <div class="inner">
    <!-- LOGO BAR -->
    <div class="logo-bar">
      <!-- Dynamically loaded logo.png if present -->
      <img class="tgp-logo-img" src="${logoBase64}" alt="TGPCET Logo">
      <div class="logo-text-block">
        <div class="dte-row"><span>DTE Code: 4151</span><span>www.tgpcet.com</span></div>
        <div class="college-name-line">TULSIRAMJI GAIKWAD-PATIL</div>
        <div class="college-sub">College of Engineering &amp; Technology</div>
        <div class="college-approved">Approved by AICTE, New Delhi and Govt. of Maharashtra | Affiliated to Rashtrasant Tukadoji Maharaj Nagpur University, Nagpur</div>
        <div class="college-auto">\u2014\u2014 AN AUTONOMOUS INSTITUTE \u2014\u2014</div>
      </div>
      <div class="logo-right-block">
        <div class="nbr-badge">NBR</div>
        <div class="idea-badge">IDEA<br>Lab</div>
        <div class="gp-divider"></div>
        <div class="gp-block">
          <div class="g-box">G</div>
          <div class="gp-text">
            <div class="gp-name">GAIKWAD-PATIL</div>
            <div class="gp-sub">GROUP OF INSTITUTIONS</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content-body">
      <div class="title-cordial"><span>Cordial Invitation</span></div>
      <div class="title-to"><span>To</span></div>
      <div class="title-main"><span>Techkruti 2k26</span></div>

      <div class="ornament">
        <div class="orn-line"></div>
        <span class="orn-arr">◄</span>
        <span class="orn-mid">❧</span>
        <span class="orn-arr">►</span>
        <div class="orn-line"></div>
      </div>

      <div class="date-block">
        <div class="date-text">Date:- <span>24<sup>th</sup> &amp; 25<sup>th</sup> March 2026</span></div>
        <div class="time-text">Time <span>10:00 am</span></div>
      </div>

      <div class="ornament">
        <div class="orn-line"></div>
        <span class="orn-arr">◄</span>
        <span class="orn-mid">❧</span>
        <span class="orn-arr">►</span>
        <div class="orn-line"></div>
      </div>

      <div class="event-block">
        <div class="ev-line"><span>National Level Tech Event</span></div>
        <div class="ev-line"><span>Techkruti 2k26</span></div>
        <div class="ev-line">Venue:- <span>Central Library, TGPCET</span></div>
      </div>

      <div class="ornament" style="margin-top:14px;">
        <div class="orn-line"></div>
        <span style="color:#8040a8;font-size:26px;">❦</span>
        <div class="orn-line"></div>
      </div>

      <div class="guest-wrap">
        <span class="guest-name">${data.guestName || 'Honoured Guest'}</span>
      </div>

      <div class="sig-block">
        ${sigImgHtml}
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  // Launch puppeteer to generate the PDF
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Wait until resources are loaded
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Set the viewport matching the card size
  await page.setViewport({ width: 720, height: 920 });

  const pdfBuffer = await page.pdf({
    width: '720px',
    height: '920px',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateInvitationPDF };
