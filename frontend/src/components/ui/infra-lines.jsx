import React, { useEffect, useRef } from "react";

export function InfraLines() {
  return (
    <div className="absolute inset-0 opacity-70" style={{ zIndex: 0 }}>
      {/* SVG for connecting lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <style>{`
            @keyframes drawLine {
              0%   { stroke-dashoffset: 1000; opacity: 0; }
              15%  { opacity: 1; }
              70%  { opacity: 0.7; }
              100% { stroke-dashoffset: 0; opacity: 0; }
            }
            .connecting-line {
              stroke: #ffffff;
              stroke-width: 1.2;
              fill: none;
              stroke-dasharray: 1000;
              animation: drawLine 3s ease-in-out infinite;
            }
          `}</style>
        </defs>
        {[...Array(19)].map((_, i) => {
          const x1 = 10 + (i % 5) * 20;
          const y1 = 10 + Math.floor(i / 5) * 25;
          const x2 = 10 + ((i + 1) % 5) * 20;
          const y2 = 10 + Math.floor((i + 1) / 5) * 25;
          return (
            <line
              key={`line-${i}`}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              className="connecting-line"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          );
        })}
      </svg>

      {/* Dots */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white"
          style={{
            left: `${10 + (i % 5) * 20}%`,
            top: `${10 + Math.floor(i / 5) * 25}%`,
            animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
}
