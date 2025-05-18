import React from 'react';

const AuthBackgroundOverlay: React.FC = () => (
  <div
    className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-200 animate-fade-in"
    aria-hidden="true"
  >
    {/* SVG dot pattern overlay - much more visible */}
    <svg
      className="absolute top-0 left-0 w-full h-full opacity-5 animate-pulse"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="3" fill="#1e3a8a" fillOpacity="0.20" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  </div>
);


export default AuthBackgroundOverlay;
