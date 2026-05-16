import React from 'react';
import { WrappedData } from '../../wrappedQueries';
import { Stat } from './components/Stat';
import { BarRow } from './components/BarRow';
import { SectionTitle } from './components/SectionTitle';

interface WrappedCardProps {
  data: WrappedData;
  title: string;
  subtitle: string;
}

/**
 * The main JSX template for the Wrapped image.
 * 
 * IMPORTANT satori constraints:
 * - ONLY flexbox layout works. No grid, no float, no position absolute except with parent relative.
 * - Every element with multiple children MUST have `display: flex`.
 * - Tailwind classes work via the `tailwindConfig` option, but plain inline styles are simpler — use inline styles.
 */
export const WrappedCard: React.FC<WrappedCardProps> = ({ data, title, subtitle }) => {
  const maxMessages = data.topUsers.length > 0 ? data.topUsers[0].count : 1;

  // Simple SVG icons
  const Icons = {
    Messages: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    Members: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    Reactions: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    TopEmoji: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #23272A 0%, #2C2F33 100%)',
        padding: '40px',
        color: '#FFFFFF',
        fontFamily: 'Inter',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
        <div style={{ display: 'flex', fontSize: '64px', fontWeight: 'bold', letterSpacing: '-2px' }}>
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: '24px', color: '#5865F2', fontWeight: 'bold' }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '40px' }}>
        {/* Left Column: Stats Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <SectionTitle>Server Snapshot</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-10px' }}>
            <Stat label="Total Messages" value={data.totalMessages.toLocaleString()} icon={Icons.Messages} />
            <Stat label="Active Members" value={data.activeMembers.toLocaleString()} icon={Icons.Members} />
            <Stat label="Total Reactions" value={data.totalReactions.toLocaleString()} icon={Icons.Reactions} />
            <Stat label="Top Emoji" value={data.topEmoji?.name || 'N/A'} icon={Icons.TopEmoji} />
          </div>
          
          <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(88, 101, 242, 0.2)', padding: '20px', borderRadius: '16px', flex: 1 }}>
              <div style={{ display: 'flex', fontSize: '14px', color: '#B9BBBE', marginBottom: '4px' }}>Busiest Day</div>
              <div style={{ display: 'flex', fontSize: '24px', fontWeight: 'bold' }}>{data.busiestDay || 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(88, 101, 242, 0.2)', padding: '20px', borderRadius: '16px', flex: 1 }}>
              <div style={{ display: 'flex', fontSize: '14px', color: '#B9BBBE', marginBottom: '4px' }}>Peak Hour</div>
              <div style={{ display: 'flex', fontSize: '24px', fontWeight: 'bold' }}>{data.peakHour !== null ? `${data.peakHour}:00` : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Top Users */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
          <SectionTitle>Most Active Members</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '30px', borderRadius: '24px', flex: 1 }}>
            {data.topUsers.length > 0 ? (
              data.topUsers.map((user, index) => (
                <BarRow 
                  key={user.userId} 
                  label={`User ${index + 1}`} // We don't have usernames here, normally we'd fetch them or pass them
                  value={user.count} 
                  max={maxMessages}
                  color={index === 0 ? '#5865F2' : index === 1 ? '#43B581' : '#FAA61A'}
                />
              ))
            ) : (
              <div style={{ display: 'flex', color: '#B9BBBE' }}>No active members this period.</div>
            )}
            
            <div style={{ display: 'flex', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '14px', color: '#B9BBBE' }}>
              Based on total messages sent
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', marginTop: '40px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', color: '#B9BBBE', fontSize: '16px' }}>
          Generated by Discord Wrapped Bot
        </div>
        <div style={{ display: 'flex', backgroundColor: '#5865F2', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          SPOTIFY STYLE
        </div>
      </div>
    </div>
  );
};
