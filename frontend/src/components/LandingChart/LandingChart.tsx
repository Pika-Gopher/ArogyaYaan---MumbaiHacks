"use client";

import { useState } from 'react';
import { Flag, Lightbulb, Calendar, Zap, TrendingUp, Cpu, Truck, ShieldCheck } from 'lucide-react';

export default function WorkflowComponent() {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const segments = [
    {
      id: 'predict',
      title: 'Perceive &\nPredict',
      icon: <TrendingUp className="w-5 h-5" />,
      angle: -45,
      color: '#6DB4FF',
      label: 'Local Demand Intelligence',
      labelPosition: { top: '15%', left: '0.01%' }
    },
    {
      id: 'recommend',
      title: 'Reason &\nRecommend',
      icon: <Cpu className="w-5 h-5" />,
      angle: 45,
      color: '#0D3D5C',
      label: 'Agentic Orchestration Engine',
      labelPosition: { top: '15%', right: '0.01%' }
    },
    {
      id: 'automate',
      title: 'Decide &\nAutomate',
      icon: <Truck className="w-5 h-5" />,
      angle: 135,
      color: '#5B9DF5',
      label: 'WorkFlow Automation',
      labelPosition: { bottom: '15%', right: '1%' }
    },
    {
      id: 'verify',
      title: 'Execute &\nVerify',
      icon: <ShieldCheck className="w-5 h-5" />,
      angle: 225,
      color: '#5B9DF5',
      label: 'PHC Mobile App',
      labelPosition: { bottom: '15%', left: '6%' }
    }
  ];

  const createSegmentPath = (angle: number, isHovered: boolean) =>{
    const startAngle = (angle - 45) * Math.PI / 180;
    const endAngle = (angle + 45) * Math.PI / 180;
    const outerRadius = isHovered ? 180 : 175;
    const innerRadius = 85;
    const cx = 200;
    const cy = 200;

    const x1 = cx + innerRadius * Math.cos(startAngle);
    const y1 = cy + innerRadius * Math.sin(startAngle);
    const x2 = cx + outerRadius * Math.cos(startAngle);
    const y2 = cy + outerRadius * Math.sin(startAngle);
    const x3 = cx + outerRadius * Math.cos(endAngle);
    const y3 = cy + outerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(endAngle);
    const y4 = cy + innerRadius * Math.sin(endAngle);

    return `M ${x1},${y1} L ${x2},${y2} A ${outerRadius},${outerRadius} 0 0,1 ${x3},${y3} L ${x4},${y4} A ${innerRadius},${innerRadius} 0 0,0 ${x1},${y1} Z`;
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center px-8 py-16">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900">
            Connect the entire supply lifecycle with ArogyaYaan
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            From predictive foresight and agentic recommendation through automated logistics and final delivery verification, bring your entire health supply chain together.
          </p>
        </div>

        {/* Right Circle Diagram */}
        <div className="relative w-full h-[550px] flex items-center justify-center">
          
          {/* Product Labels*/}
          {segments.map((segment) => (
            <div
              key={`label-${segment.id}`}
              className="absolute z-30"
              style={segment.labelPosition}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="18" height="18" rx="3" fill="#2684FF"/>
                    <path d="M9 4L11 9L9 14L7 9L9 4Z" fill="white"/>
                  </svg>
                  <span className="text-sm font-semibold whitespace-pre-line text-gray-900">{segment.label}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Main Circle Container */}
          <div className="relative w-[500px] h-[500px]">
            
            {/* Center Circle with Infinity Symbol */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-100">
                <svg width="70" height="40" viewBox="0 0 100 50" fill="none">
                  <path 
                    d="M15 25 C15 15, 25 10, 30 15 C35 20, 40 25, 50 25 C60 25, 65 20, 70 15 C75 10, 85 15, 85 25 C85 35, 75 40, 70 35 C65 30, 60 25, 50 25 C40 25, 35 30, 30 35 C25 40, 15 35, 15 25 Z" 
                    fill="black"
                    stroke="black"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* SVG for Circle Segments */}
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {segments.map((segment) => {
                const isHovered = hoveredSegment === segment.id;
                const pathData = createSegmentPath(segment.angle, isHovered);

                return (
                  <g key={segment.id}>
                    <path
                      d={pathData}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="3"
                      className="transition-all duration-300 ease-out cursor-pointer"
                      style={{
                        filter: isHovered ? 'url(#glow) brightness(1.1)' : 'none',
                        transformOrigin: '200px 200px',
                      }}
                      onMouseEnter={() => setHoveredSegment(segment.id)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Text Labels and Icons on Segments */}
            {segments.map((segment) => {
              const isHovered = hoveredSegment === segment.id;
              const angleRad = segment.angle * Math.PI / 180;
              const radius = isHovered ? 160 : 150;
              const x = 250 + radius * Math.cos(angleRad);
              const y = 250 + radius * Math.sin(angleRad);

              return (
                <div
                  key={`text-${segment.id}`}
                  className="absolute pointer-events-none transition-all duration-300 ease-out z-10"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
                  }}
                  onMouseEnter={() => setHoveredSegment(segment.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex flex-col items-center text-white text-center gap-2">
                    <div>
                      {segment.icon}
                    </div>
                    <div className="font-bold text-sm leading-tight whitespace-pre-line">
                      {segment.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}