import React from 'react';

const CTABanner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="relative w-full max-w-7xl">
        {/* Green accent bar - bottom layer with exact shape */}
        <div 
          className="absolute bottom-0 right-0 h-10 bg-linear-to-r from-[#82B536] to-[#82B536]"
          style={{
            width: '65%',
            clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)',
            transform: 'translateY(16px)'
          }}
        ></div>
        
        {/* Main blue banner - top layer with exact skewed shape */}
        <div 
          className="relative bg-linear-to-r from-blue-600 to-blue-500 shadow-2xl px-12 py-16 md:px-20 md:py-20 overflow-visible"
          style={{
            clipPath: 'polygon(0% 0%, 95% 0%, 100% 100%, 0% 100%)'
          }}
        >
          {/* Sparkle/shine decorative element */}
          <div className="absolute" style={{ top: '50px', left: '150px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <g opacity="0.8">
                <line x1="20" y1="5" x2="20" y2="15" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <line x1="20" y1="25" x2="20" y2="35" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <line x1="5" y1="20" x2="15" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <line x1="25" y1="20" x2="35" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          
          {/* Gear icon with curved arrow - positioned in top right */}
          <div className="absolute" style={{ top: '65px', right: '100px' }}>
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
              {/* Curved arrow pointing to gear */}
              <path 
                d="M 85 20 Q 105 10, 110 25" 
                stroke="white" 
                strokeWidth="2.5" 
                fill="none"
                strokeLinecap="round"
              />
              {/* Arrow head */}
              <path 
                d="M 110 25 L 105 22 M 110 25 L 112 20" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Gear icon */}
              <g transform="translate(30, 30)">
                {/* Gear teeth */}
                <g fill="#FCD34D">
                  <rect x="22" y="-2" width="6" height="8" rx="1"/>
                  <rect x="22" y="44" width="6" height="8" rx="1"/>
                  <rect x="-2" y="22" width="8" height="6" rx="1"/>
                  <rect x="44" y="22" width="8" height="6" rx="1"/>
                  <rect x="36" y="5" width="6" height="8" rx="1" transform="rotate(45 39 9)"/>
                  <rect x="8" y="5" width="6" height="8" rx="1" transform="rotate(-45 11 9)"/>
                  <rect x="36" y="37" width="6" height="8" rx="1" transform="rotate(-45 39 41)"/>
                  <rect x="8" y="37" width="6" height="8" rx="1" transform="rotate(45 11 41)"/>
                </g>
                {/* Outer circle of gear */}
                <circle cx="25" cy="25" r="16" fill="#FCD34D"/>
                {/* Inner circle (hole) */}
                <circle cx="25" cy="25" r="8" fill="#1E3A8A"/>
              </g>
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-3xl font-bold text-white mb-6 leading-tight">
              Move beyond reactive crises. Ensure zero stockouts.
            </h1>
            
            <p className="text-xl md:text-2xl text-white/95 mb-10 font-medium">
              Leave the manual guesswork behind and build a resilient supply chain that guarantees last-mile medicine availability.
            </p>
            
            <button className="bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTABanner;