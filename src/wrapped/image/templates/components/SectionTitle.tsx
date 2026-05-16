import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: '20px',
        marginTop: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          paddingBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {children}
      </div>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        }}
      />
    </div>
  );
};
