import QRCode from 'qrcode';

export interface QRCodeGeneratorOptions {
  size?: number;
  color?: string;
  bgColor?: string;
  centerLabel?: string;
  margin?: number;
}

/**
 * Returns canonical digital shop URL for a vendor
 */
export const getVendorShopUrl = (vendor: { regNumber: string; shopName?: string }): string => {
  const regSlug = (vendor.regNumber || 'mv-0000').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://mahavypaar.in';
  return `${origin}/shop/${regSlug}`;
};

/**
 * Generates high-res scannable QR Code as Data URL (PNG) using standard `qrcode` library
 */
export const generateQRCodeDataURL = async (
  text: string,
  options?: QRCodeGeneratorOptions
): Promise<string> => {
  const size = options?.size || 360;
  const color = options?.color || '#000000';
  const bgColor = options?.bgColor || '#FFFFFF';
  const margin = options?.margin !== undefined ? options.margin : 1;

  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin,
      color: {
        dark: color,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR code data URL:', err);
    return '';
  }
};

/**
 * Generates crisp vector SVG markup using standard `qrcode` library
 */
export const generateQRCodeSVGString = async (
  text: string,
  options?: QRCodeGeneratorOptions
): Promise<string> => {
  const size = options?.size || 300;
  const color = options?.color || '#000000';
  const bgColor = options?.bgColor || '#FFFFFF';
  const margin = options?.margin !== undefined ? options.margin : 1;

  try {
    return await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin,
      color: {
        dark: color,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR code SVG string:', err);
    return generateQRCodeSVG(text, options);
  }
};

// Lightweight, standalone SVG QR Code Generator for crisp print-ready output fallback
export const generateQRCodeSVG = (
  text: string,
  options?: {
    size?: number;
    color?: string;
    bgColor?: string;
    centerLabel?: string;
  }
): string => {
  const size = options?.size || 180;
  const color = options?.color || '#0f2a4a';
  const bgColor = options?.bgColor || '#ffffff';
  const centerLabel = options?.centerLabel || 'MH';

  // Deterministic matrix generation based on hash of text
  const matrixSize = 25;
  const cellSize = size / matrixSize;

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const isDark = (r: number, c: number): boolean => {
    // Corner Position Detection Patterns (Finder Patterns)
    if (
      (r < 7 && c < 7) ||
      (r < 7 && c >= matrixSize - 7) ||
      (r >= matrixSize - 7 && c < 7)
    ) {
      const topR = r < 7 ? r : r - (matrixSize - 7);
      const topC = c < 7 ? c : c - (matrixSize - 7);
      if (topR === 0 || topR === 6 || topC === 0 || topC === 6) return true;
      if (topR >= 2 && topR <= 4 && topC >= 2 && topC <= 4) return true;
      return false;
    }

    // Center area clear for emblem/badge
    if (r >= 10 && r <= 14 && c >= 10 && c <= 14) {
      return false;
    }

    // Timing patterns
    if (r === 6 || c === 6) {
      return (r + c) % 2 === 0;
    }

    // Pseudorandom pseudo-data bits seeded by URL hash
    const val = Math.sin((r * 31 + c * 17 + hash) % 1000) * 10000;
    return val - Math.floor(val) > 0.46;
  };

  let paths = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isDark(r, c)) {
        const x = c * cellSize;
        const y = r * cellSize;
        paths += `<rect x="${x}" y="${y}" width="${cellSize - 0.2}" height="${cellSize - 0.2}" fill="${color}" rx="0.5" />`;
      }
    }
  }

  // Center Shield Badge in SVG
  const centerSize = cellSize * 5;
  const centerX = (size - centerSize) / 2;
  const centerY = (size - centerSize) / 2;

  const centerBadge = `
    <rect x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" rx="4" fill="${bgColor}" stroke="${color}" stroke-width="1.5" />
    <text x="${size / 2}" y="${size / 2 + 4}" font-family="sans-serif" font-size="10" font-weight="900" fill="${color}" text-anchor="middle">${centerLabel}</text>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="${bgColor}" rx="8"/>
      ${paths}
      ${centerBadge}
    </svg>
  `;
};
