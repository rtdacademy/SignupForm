import React from 'react';

function LogoOverlay({ logoUrl, position, size, opacity, link }) {
  if (!logoUrl) return null;

  // Determine size classes
  const sizeClasses = {
    small: 'w-12 h-12 md:w-16 md:h-16',
    medium: 'w-16 h-16 md:w-20 md:h-20',
    large: 'w-20 h-20 md:w-24 md:h-24'
  };

  // Determine position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`absolute ${positionClasses[position] || positionClasses['bottom-right']} z-10`}
      style={{ opacity: opacity / 100 }}
    >
      <div
        className={`${sizeClasses[size] || sizeClasses.medium} ${link ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
        role={link ? 'button' : undefined}
        tabIndex={link ? 0 : undefined}
        onKeyDown={(e) => {
          if (link && (e.key === 'Enter' || e.key === ' ')) {
            handleClick();
          }
        }}
      >
        <img
          src={logoUrl}
          alt="Logo"
          className="w-full h-full object-contain drop-shadow-lg"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}

export default LogoOverlay;