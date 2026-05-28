export function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0510]">
      {/* Vibrant Neon Grid (2D to avoid 3D lag) */}
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: 'linear-gradient(rgba(0, 255, 200, 0.3) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 0, 128, 0.3) 2px, transparent 2px)',
             backgroundSize: '50px 50px',
             backgroundPosition: '0 0',
             animation: 'gridFly 2s linear infinite'
           }} />
           
      {/* Glowing Orbs */}
      <div className="absolute left-1/4 top-1/4 w-[600px] h-[600px] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute right-1/4 bottom-1/4 w-[600px] h-[600px] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%)', backgroundSize: '100% 4px' }} />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0510] via-transparent to-[#0a0510]/80" />
    </div>
  );
}
