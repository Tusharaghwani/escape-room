export function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic 3D Grid */}
      <div className="absolute inset-x-0 bottom-0 h-[70vh] cyber-grid-container">
        <div className="cyber-grid"></div>
      </div>
      
      {/* Floating Orbs / Particles */}
      {[...Array(6)].map((_, i) => (
        <div key={`orb-${i}`} className="absolute rounded-full mix-blend-screen"
             style={{
               width: 300 + Math.random() * 200,
               height: 300 + Math.random() * 200,
               background: `radial-gradient(circle, rgba(${i%2===0?0:100}, 255, ${i%2===0?255:150}, 0.15) 0%, transparent 60%)`,
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 60}%`,
               transform: 'translate(-50%, -50%)',
               animation: `floatOrb ${10 + Math.random() * 10}s ease-in-out infinite alternate`,
               filter: 'blur(30px)'
             }} />
      ))}
      
      {/* Fog Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
    </div>
  );
}
