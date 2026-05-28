export function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#030712]">
      {/* Animated Gradient Nebula (Zero Lag, Native CSS Gradients) */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute w-[150vw] h-[150vh] -top-[25vh] -left-[25vw] animate-slow-spin"
             style={{
               background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)'
             }} />
        <div className="absolute w-[150vw] h-[150vh] -top-[25vh] -left-[25vw] animate-slow-spin-reverse"
             style={{
               background: 'radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)'
             }} />
      </div>

      {/* Crisp Dotted Grid Overlay */}
      <div className="absolute inset-0 opacity-20"
           style={{
             backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             backgroundPosition: '0 0',
             animation: 'pan-grid 60s linear infinite'
           }} />
           
      {/* Edge Fades for seamless blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/30 to-[#030712]" />
    </div>
  );
}
