import QRCode from 'qrcode';

export interface StandeeQRData {
  tableNumber: number;
  url: string;
}

export async function generateQRCodeDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#0F172A', // Midnight slate brand color
      light: '#FFFFFF',
    },
    width: 320,
    ...options,
  };

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

export function buildUpiPaymentString(
  amount: number,
  tableNumber: number,
  orderId: string
): string {
  const vpa = 'bluesky@icici';
  const name = 'Blue Sky Rooftop Lounge';
  const note = `Table ${tableNumber} Order ${orderId}`;
  return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

export function buildTableOrderUrl(tableNumber: number): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/?table=${tableNumber}`;
  }
  return `https://bluesky.dining/table/${tableNumber}`;
}
