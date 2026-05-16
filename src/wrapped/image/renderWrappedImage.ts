import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { WrappedData } from '../wrappedQueries';
import { WrappedCard } from './templates/WrappedCard';
import { loadFonts } from './loadFonts';

/**
 * Renders a Spotify-Wrapped style PNG image from the provided data.
 * 
 * @param data The wrapped data to display
 * @param title The main title (e.g. "Weekly Wrapped")
 * @param subtitle The subtitle (e.g. "May 10 - May 17, 2026")
 * @returns A Buffer containing the PNG image data
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
      height: 630,
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
