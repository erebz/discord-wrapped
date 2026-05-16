import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWrappedResponse } from '../wrapped/renderWrappedEmbed';
import { renderWrappedImage } from '../wrapped/image/renderWrappedImage';
import { WrappedData } from '../wrapped/wrappedQueries';

// Mock the image rendering pipeline
vi.mock('../wrapped/image/renderWrappedImage', () => ({
  renderWrappedImage: vi.fn(),
}));

// Mock logger to avoid cluttering test output
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('renderWrappedResponse', () => {
  const mockData: WrappedData = {
    totalMessages: 100,
    activeMembers: 5,
    topChannel: 'channel-1',
    busiestDay: 'Monday',
    peakHour: 18,
    totalReactions: 20,
    topEmoji: { name: '🔥', id: null, isAnimated: false },
    mostReactiveMember: 'user-1',
    topUsers: [{ userId: 'user-1', count: 50 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an image attachment when rendering succeeds', async () => {
    const mockBuffer = Buffer.from('fake-png-data');
    (renderWrappedImage as any).mockResolvedValue(mockBuffer);

    const result = await renderWrappedResponse('Title', 'Subtitle', mockData);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].name).toBe('wrapped.png');
    expect(result.embeds[0].data.image?.url).toBe('attachment://wrapped.png');
    expect(result.embeds[0].data.title).toBe('Title');
  });

  it('should fallback to text embed when image rendering fails', async () => {
    (renderWrappedImage as any).mockRejectedValue(new Error('Font loading failed'));

    const result = await renderWrappedResponse('Title', 'Subtitle', mockData);

    expect(result.files).toHaveLength(0);
    expect(result.embeds).toHaveLength(1);
    expect(result.embeds[0].data.description).toContain('**100** messages sent');
    expect(result.embeds[0].data.title).toBe('Title');
  });
});
