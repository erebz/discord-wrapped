import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  icon?: string;
}

export const Stat: React.FC<StatProps> = ({ label, value, icon }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        borderRadius: '16px',
        width: '280px',
        margin: '10px',
      }}
    >
      <div style={{ display: 'flex', fontSize: '18px', color: '#B9BBBE', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {value}
      </div>
    </div>
  );
};
