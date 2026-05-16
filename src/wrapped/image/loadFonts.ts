import fs from 'fs';
import path from 'path';

let regularFont: Buffer | null = null;
let boldFont: Buffer | null = null;

/**
 * Loads and caches Inter fonts from the local file system.
 * These are used by satori to render text in the generated SVG.
 */
export async function loadFonts(): Promise<{ regular: Buffer; bold: Buffer }> {
  if (regularFont && boldFont) {
    return { regular: regularFont, bold: boldFont };
  }

  const fontsDir = path.join(__dirname, 'fonts');
  
  try {
    regularFont = fs.readFileSync(path.join(fontsDir, 'Inter-Regular.ttf'));
    boldFont = fs.readFileSync(path.join(fontsDir, 'Inter-Bold.ttf'));
    
    return { regular: regularFont, bold: boldFont };
  } catch (error) {
    console.error('Error loading fonts:', error);
    // If fonts are missing, we might want to throw or return a fallback.
    // Given the instructions, we expect them to be there.
    throw new Error('Failed to load fonts. Make sure Inter-Regular.ttf and Inter-Bold.ttf are in src/wrapped/image/fonts/');
  }
}
