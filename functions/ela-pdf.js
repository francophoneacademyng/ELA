/* ============================================================
   ELA — functions/ela-pdf.js
   ------------------------------------------------------------
   Template UNIQUE du PDF officiel ELA (toutes académies).
   Utilisé par generateELACertificatePdf (callable) et par le
   trigger generateCertificate. pdfkit + QR code (pointe vers
   la verificationUrl publique).
   ============================================================ */

const QRCode = require('qrcode');

/**
 * Construit le buffer PDF officiel d'un certificat ELA.
 * @param {object} cert document ela_certificates
 * @returns {Promise<Buffer>}
 */
async function makeOfficialPdfBuffer(cert) {
  const PDFDocument = require('pdfkit');
  const qrDataUrl = await QRCode.toDataURL(cert.verificationUrl, { margin: 1, width: 220 });
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    drawOfficialPdf(doc, cert, qrDataUrl);
    doc.end();
  });
}

/* Template officiel unique du PDF ELA. */
/* Template officiel unique du PDF ELA. */
function drawOfficialPdf(doc, cert, qrDataUrl) {
  const W = 841.89, H = 595.28;
  doc.rect(0, 0, W, H).fill('#063D2C');
  doc.lineWidth(2).rect(24, 24, W - 48, H - 48).stroke('#C9A227');
  doc.lineWidth(0.5).rect(30, 30, W - 60, H - 60).stroke('#C9A227');

  doc.fillColor('#C9A227').fontSize(16).font('Times-Bold')
    .text('E-LEARN LANGUAGE ACADEMY', 0, 60, { align: 'center' });
  doc.fillColor('#8ea79b').fontSize(9).font('Helvetica')
    .text('E-Learn Language Academy — sole issuing institution of ELA certificates', 0, 82, { align: 'center' });

  const titles = {
    completion: 'Certificate of Participation — ELA',
    achievement: 'Certificate of Achievement — ELA',
    certification: 'ELA Certificate — CEFR Level (Official)'
  };
  doc.fillColor('#FAF6EC').fontSize(28).font('Times-Bold')
    .text(titles[cert.certificateType] || titles.certification, 0, 110, { align: 'center' });

  doc.fillColor('#8ea79b').fontSize(11).font('Helvetica').text('This certifies that', 0, 165, { align: 'center' });
  doc.fillColor('#FAF6EC').fontSize(26).font('Times-Bold').text(String(cert.studentName), 0, 188, { align: 'center' });

  const typeLabels = {
    completion: 'has attended the programme of',
    achievement: 'has successfully completed the programme of',
    certification: 'has been certified at CEFR level by'
  };
  doc.fillColor('#8ea79b').fontSize(11).text(typeLabels[cert.certificateType] || typeLabels.certification, 0, 232, { align: 'center' });
  doc.fillColor('#C9A227').fontSize(15).font('Times-Bold')
    .text(cert.academyLabel + '  ·  Level ' + cert.cecrLevel, 0, 252, { align: 'center' });

  doc.fillColor('#FAF6EC').fontSize(12).font('Helvetica')
    .text('Global score: ' + (cert.scoreGlobal || 0) + '%', 0, 286, { align: 'center' });
  doc.fillColor('#8ea79b').fontSize(10)
    .text('Issued: ' + cert.issueDate + '   ·   Valid until: ' + cert.expiryDate, 0, 320, { align: 'center' });
  doc.fillColor('#C9A227').font('Courier-Bold').fontSize(11)
    .text('Certificate No. ' + cert.id, 0, 336, { align: 'center' });

  doc.fillColor('#8ea79b').font('Helvetica').fontSize(10)
    .text('SHA-256 integrity hash - verifiable online via ELA', 0, H - 92, { align: 'center' });
  doc.fillColor('#5f7d70').fontSize(6.5).font('Courier')
    .text(cert.signatureAlgorithm + ' integrity hash: ' + cert.signatureHash, 0, H - 68, { align: 'center' });
  doc.fillColor('#8ea79b').fontSize(8).font('Helvetica')
    .text('Verify this certificate at ' + cert.verificationUrl, 0, H - 52, { align: 'center' });

  try {
    const qrBuf = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    doc.image(qrBuf, W - 130, 90, { width: 90 });
    doc.fillColor('#8ea79b').fontSize(7).text('Scan to verify', W - 140, 182, { width: 100, align: 'center' });
  } catch (qrErr) {
    console.error('[ELA-Cert] QR embed failed:', qrErr.message);
  }
}

module.exports = { makeOfficialPdfBuffer, drawOfficialPdf };