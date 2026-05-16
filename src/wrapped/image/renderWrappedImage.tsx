import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { WrappedData } from '../wrappedQueries';
import { WrappedCard } from './templates/WrappedCard';
import { loadFonts } from './loadFonts';

const emojiCache = new Map<string, string>();

/**
 * Converts a Unicode string into a Twemoji-compatible code point string.
 */
function getEmojiCodePoint(emoji: string): string {
  const codePoints = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp) codePoints.push(cp.toString(16));
  }
  return codePoints.join('-');
}

/**
 * Fetches an emoji SVG from Twemoji CDN and returns it as a base64 data URL.
 */
async function fetchEmojiAsDataUrl(code: string): Promise<string | undefined> {
  if (emojiCache.has(code)) return emojiCache.get(code);

  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code.toLowerCase()}.svg`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return undefined;
    const svg = await resp.text();
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    emojiCache.set(code, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error(`Failed to fetch emoji ${code}:`, error);
    return undefined;
  }
}

/**
 * Renders a Spotify-Wrapped style PNG image from the provided data.
 */
export async function renderWrappedImage(
  data: WrappedData,
  title: string,
  subtitle: string
): Promise<Buffer> {
  const { regular, bold } = await loadFonts();

  const svg = await satori(
    <WrappedCard data={data} title={title} subtitle={subtitle} />,
    {
      width: 1200,
      height: 820,
      fonts: [
        {
          name: 'Inter',
          data: regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: bold,
          weight: 700,
          style: 'normal',
        },
      ],
      loadAdditionalAsset: async (code, segment) => {
        if (code === 'emoji') {
          return await fetchEmojiAsDataUrl(getEmojiCodePoint(segment));
        }
        return undefined;
      },
    }
  );

  const resvg = new Resvg(svg, {
    background: '#23272A',
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
