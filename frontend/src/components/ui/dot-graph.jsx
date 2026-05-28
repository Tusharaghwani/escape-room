import React, { useEffect, useRef } from "react";

export function DotGraph({
  color = "white",
  height = 32,
  freq1 = 0.35,
  freq2 = 0.12,
  freqT = 0.7,
  speed = 0.025,
  baseline = 0.3,
  amplitude = 0.5,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const timeRef = useRef(Math.random() * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.offsetWidth || 300;
    const H = height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const t = timeRef.current;
      const cols = Math.floor(W / 8);

      for (let i = 0; i < cols; i++) {
        const raw = baseline + amplitude * Math.sin(i * freq1 + t) * Math.cos(i * freq2 + t * freqT);
        const v = Math.max(0, Math.min(1, raw));
        const dotY = H - 4 - v * (H - 8);
        const x = i * 8 + 4;
        const alpha = 0.15 + v * 0.55;
        const r = 1.5 + v * 1.2;

        ctx.beginPath();
        ctx.arc(x, dotY, r, 0, Math.PI * 2);
        ctx.fillStyle = color === "green"
          ? `rgba(236, 168, 214, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      timeRef.current += speed;
      frameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, [color, height, freq1, freq2, freqT, speed, baseline, amplitude]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px`, display: "block" }}
    />
  );
}
