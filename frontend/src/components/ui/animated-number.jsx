import React, { useEffect, useState, useRef } from "react";

export function AnimatedNumber({ end, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const [isScrambling, setIsScrambling] = useState(true);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Fallback if IntersectionObserver isn't working/ready
    const duration = 2500;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      setIsScrambling(progress < 0.8);
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    // We just animate immediately for the dashboard since it's above the fold,
    // or trigger when end value changes.
    setHasAnimated(true);
    requestAnimationFrame(animate);
    
  }, [end]);

  const displayValue = count.toLocaleString();

  return (
    <div ref={ref} className="inline-flex items-baseline font-display">
      <span className="text-muted-foreground mr-1" style={{ color: '#94a3b8' }}>{prefix}</span>
      <span className="tabular-nums" style={{ color: 'white' }}>
        {displayValue.split("").map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-all duration-150 ${
              isScrambling && char !== "," ? "blur-[1px]" : ""
            }`}
          >
            {char}
          </span>
        ))}
      </span>
      <span className="text-muted-foreground ml-1" style={{ color: '#94a3b8' }}>{suffix}</span>
    </div>
  );
}
