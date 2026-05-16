import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
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
      <div style={{ display: 'flex', fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF', alignItems: 'center' }}>
        {icon && <div style={{ display: 'flex', marginRight: '12px' }}>{icon}</div>}
        {value}
      </div>
    </div>
  );
};
