import React from 'react';

const StarIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 16,
  color = '#43A047',
  className = '',
}) => (
  <span
    className={className}
    style={{
      fontSize: size,
      color,
      display: 'inline-block',
      lineHeight: 1,
      verticalAlign: 'middle',
    }}
    aria-label="star"
  >
    ★
  </span>
);

export default StarIcon;
