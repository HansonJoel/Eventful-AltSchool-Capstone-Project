import QRCode from "qrcode";

// Generate QR code for ticket
export const generateQRCode = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data);
    return qrDataUrl;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};
