import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: '20px',
        marginTop: '10px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '8px',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};
