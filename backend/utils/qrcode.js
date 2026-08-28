const QRCode = require('qrcode');

// Returns a base64 data URL that the frontend can drop straight into an <img src>
async function generateQRDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 260 });
}

module.exports = { generateQRDataUrl };
