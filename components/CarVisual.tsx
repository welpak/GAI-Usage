import React from 'react';

export const CarVisual: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-900 rounded-full blur-[100px] opacity-20"></div>
      
      {/* Central "Core" Graphics */}
      <div className="relative z-10 w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00ccff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3366ff', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="45" stroke="#333" strokeWidth="1" fill="none" strokeDasharray="5,5" />
          
          {/* Inner Rotating Rings */}
          <path d="M50 10 A40 40 0 0 1 90 50" stroke="url(#grad1)" strokeWidth="2" fill="none" className="animate-pulse">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
          </path>
          <path d="M50 90 A40 40 0 0 1 10 50" stroke="url(#grad1)" strokeWidth="2" fill="none" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="15s" repeatCount="indefinite" />
          </path>
          
          {/* Core */}
          <circle cx="50" cy="50" r="15" fill="#111" stroke="url(#grad1)" strokeWidth="2" />
          <circle cx="50" cy="50" r="8" fill="#fff" className="animate-pulse" />
        </svg>
      </div>

      {/* Floating data points */}
      <div className="absolute top-10 left-10 text-xs text-gray-500 font-mono">
        <div>SYS.OP: NORMAL</div>
        <div>CORE.TEMP: 42°C</div>
      </div>
      
      <div className="absolute bottom-10 right-10 text-xs text-right text-gray-500 font-mono">
        <div>NET.UPLINK: ACTIVE</div>
        <div>SEC.PROTO: TLS 1.3</div>
      </div>
    </div>
  );
};