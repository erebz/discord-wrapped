import React from 'react';

interface BarRowProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export const BarRow: React.FC<BarRowProps> = ({ label, value, max, color = '#5865F2' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          color: '#FFFFFF',
          fontSize: '16px',
        }}
      >
        <div style={{ display: 'flex' }}>{label}</div>
        <div style={{ display: 'flex', fontWeight: 'bold' }}>{value.toLocaleString()}</div>
      </div>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '6px',
          }}
        />
      </div>
    </div>
  );
};
