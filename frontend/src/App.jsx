import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree';
import { BlurWord } from './components/ui/blur-word';
import { HeroGrid } from './components/ui/hero-grid';
import { ParticleVisualization } from './components/ui/particle-visualization';
import { DotGraph } from './components/ui/dot-graph';
import { AnimatedNumber } from './components/ui/animated-number';
import { InfraLines } from './components/ui/infra-lines';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/* ── Micro-components ───────────────────────────────────────────── */
const Orb = ({ color, size, x, y, opacity = 0.35 }) => (
  <div className="orb" style={{
    background: color, width: size, height: size,
    left: x, top: y, opacity,
  }} />
);

const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    trap:    'badge badge-trap',
    fog:     'badge badge-fog',
    safe:    'badge badge-safe',
    paradox: 'badge badge-paradox',
    default: 'badge',
  };
  return <span className={styles[variant] || styles.default}>{children}</span>;
};

const StatCard = ({ icon, label, value, accent = '#635bff' }) => (
  <div className="glass rounded-xl p-4 flex items-center gap-4 transition-all hover-lift">
    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: accent }}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{label}</div>
      <div className="stat-num text-white text-2xl font-display mt-1">{value}</div>
    </div>
  </div>
);

/* ── Auth Screen ─────────────────────────────────────────────────── */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  const words = ["survive", "escape", "navigate", "conquer"];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-black auth-page" style={{ padding: 0 }}>
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline aria-hidden="true" className="w-full h-full object-cover object-center opacity-40">
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      </div>

      <HeroGrid />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Hero Text */}
        <div className="lg:max-w-[55%]">
          <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-white/60">
              <span className="w-8 h-px bg-white/30" />
              Infinite AI-generated labyrinth
            </span>
          </div>
          
          <div className="mb-12">
            <h1 className={`text-left text-[clamp(2.5rem,6vw,6rem)] font-display leading-[0.95] tracking-tight text-white transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="block whitespace-nowrap">Enter the maze,</span>
              <span className="block whitespace-nowrap">
                try to{" "}
                <span className="relative inline-block text-white">
                  <BlurWord word={words[wordIndex]} trigger={wordIndex} />
                </span>
              </span>
            </h1>
          </div>

          {/* Feature pills */}
          <div className={`flex flex-wrap gap-3 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            {['🧠 AI Analysis', '🌫 Fog of War', '⊘ Paradox Detection', '🗺 Live Map'].map(f => (
              <div key={f} className="text-[12px] text-slate-300 px-4 py-2 rounded-full font-mono uppercase tracking-wider"
                   style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className={`w-full max-w-[400px] transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="glass-strong rounded-3xl p-8" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(32px)' }}>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-2">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #635bff, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, boxShadow: '0 8px 24px rgba(99,91,255,0.3)'
                }}>🔮</div>
                <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: 'white' }}>
                  Terminal Access
                </span>
              </div>
            </div>

            <div className="flex gap-1 p-1 mb-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {['login','register'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={mode === m ? {
                    background: 'white',
                    color: 'black',
                  } : { background: 'transparent', color: '#94a3b8' }}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl text-sm text-red-300 flex items-center gap-2"
                   style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Username</label>
                <input
                  required type="text" value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field font-mono"
                  placeholder="your_handle"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <input
                  required type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field font-mono"
                  placeholder="••••••••"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full mt-4 rounded-xl font-semibold transition-all hover-lift"
                style={{ padding: '14px', fontSize: 15, background: 'white', color: 'black' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'black', borderRadius: '50%', display: 'inline-block', animation: 'spin-border 0.6s linear infinite' }} />
                    Authenticating
                  </span>
                ) : (mode === 'login' ? 'Sign In' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Topbar ─────────────────────────────────────────────────────── */
function Topbar({ user, activities, onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '0 32px',
      height: 64,
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
        }}>🔮</div>
        <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: 'white' }}>Maze Terminal</span>
      </div>

      {/* Live pulse ticker */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', display: 'inline-block', boxShadow: '0 0 8px #ffffff', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, color: '#ffffff', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>LIVE</span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="animate-marquee" style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
              {[...activities, ...activities].map((act, i) => (
                <span key={i} style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                  {act.message}
                  <span style={{ color: '#334155', marginLeft: 12 }}>
                    [{new Date(act.created_at + "Z").toLocaleTimeString()}]
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 12px',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: 'black', flexShrink: 0
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', fontFamily: 'JetBrains Mono' }}>{user.username}</span>
          <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{user.points || 0} pts</span>
        </div>
        <button onClick={onLogout} className="btn-ghost" style={{ padding: '6px 10px' }} title="Log out">
          ↩
        </button>
      </div>
    </header>
  );
}

/* ── Leaderboard ────────────────────────────────────────────────── */
function Leaderboard({ entries, currentUser }) {
  const medals = ['1', '2', '3'];
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Leaderboard</span>
      </div>
      <div style={{ padding: '8px 0' }}>
        {entries.slice(0, 8).map((u, i) => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 18px',
            background: u.username === currentUser ? 'rgba(99,91,255,0.08)' : 'transparent',
            transition: 'background 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 20, textAlign: 'center', fontSize: 13 }}>{medals[i] || `${i+1}`}</span>
              <span style={{ fontSize: 13, fontWeight: u.username === currentUser ? 700 : 500,
                             color: u.username === currentUser ? '#a78bfa' : '#e2e8f0' }}>
                {u.username}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', fontFamily: 'JetBrains Mono' }}>{u.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Door Card ──────────────────────────────────────────────────── */
function DoorCard({ door, guess, setGuess, onSolve }) {
  const isParadox = door.is_paradox;
  const isTrap    = door.sentiment === 'dark' && !isParadox;
  const isSafe    = door.sentiment === 'light' && !isParadox && door.complexity_score >= 40;
  const isFog     = door.complexity_score < 40 && !isParadox;

  const className = `glass door-card rounded-2xl ${isTrap ? 'door-dark' : isSafe ? 'door-light' : isFog ? 'door-fog' : ''}`;

  return (
    <div className={className} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>DOOR #{door.id}</span>
          {isTrap    && <Badge variant="trap">⚠ Trap Room</Badge>}
          {isFog     && <Badge variant="fog">🌫 Fog Room</Badge>}
          {isSafe    && <Badge variant="safe">✓ Safe Node</Badge>}
          {isParadox && <Badge variant="paradox">⊘ Paradox</Badge>}
        </div>
        {/* Complexity bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Complexity</span>
          <div style={{ width: 60, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 100,
              width: `${Math.min(100, door.complexity_score || 50)}%`,
              background: isFog ? '#a855f7' : isTrap ? '#ef4444' : isSafe ? '#3b82f6' : '#635bff',
              transition: 'width 1s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Riddle text */}
      <div style={{ flex: 1 }}>
        {isParadox ? (
          <div className="glitch-effect" data-text={`"${door.question}"`}
               style={{ fontSize: 15, lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>
            "{door.question}"
          </div>
        ) : (
          <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>
            "{door.question}"
          </p>
        )}
      </div>

      {/* Info line */}
      {(isTrap || isFog || isSafe || isParadox) && (
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', padding: '6px 10px', borderRadius: 8,
                      background: isParadox ? 'rgba(0,255,65,0.06)' : isTrap ? 'rgba(239,68,68,0.06)' : isFog ? 'rgba(168,85,247,0.06)' : 'rgba(59,130,246,0.06)',
                      color: isParadox ? '#00ff41' : isTrap ? '#fca5a5' : isFog ? '#c4b5fd' : '#93c5fd',
                      border: `1px solid ${isParadox ? 'rgba(0,255,65,0.15)' : isTrap ? 'rgba(239,68,68,0.15)' : isFog ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)'}` }}>
          {isParadox && '⊘ CORE ERROR: LOGICAL CONTRADICTION · +20 PTS BONUS'}
          {isTrap    && '⚠ WARNING: HOSTILE ATMOSPHERE · HIGH DIFFICULTY'}
          {isFog     && '🌫 COGNITIVE HAZARD: FOG OF WAR ACTIVE'}
          {isSafe    && '✓ STABLE NODE: SAFE ENTRY RECOMMENDED'}
        </div>
      )}

      {/* Answer input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder={isTrap ? 'Tread carefully...' : isFog ? 'Analyze carefully...' : 'Your answer...'}
          className="input-field"
          style={{ flex: 1, padding: '10px 14px', fontSize: 14,
                   borderColor: isParadox ? 'rgba(0,255,65,0.3)' : isTrap ? 'rgba(239,68,68,0.3)' : isFog ? 'rgba(168,85,247,0.3)' : isSafe ? 'rgba(59,130,246,0.3)' : undefined }}
          onChange={(e) => setGuess(e.target.value)}
          id={`answer-door-${door.id}`}
        />
        <button
          onClick={() => onSolve(door.id)}
          className="btn-primary"
          id={`solve-door-${door.id}`}
          style={{
            padding: '10px 20px', fontSize: 14, flexShrink: 0,
            background: isParadox ? 'linear-gradient(135deg, #065f46, #047857)' :
                        isTrap    ? 'linear-gradient(135deg, #991b1b, #dc2626)' :
                        isFog     ? 'linear-gradient(135deg, #581c87, #7c3aed)' :
                        isSafe    ? 'linear-gradient(135deg, #1e40af, #2563eb)' :
                        'linear-gradient(135deg, #635bff, #7c3aed)',
            boxShadow: isParadox ? '0 4px 20px rgba(0,255,65,0.25)' :
                       isTrap    ? '0 4px 20px rgba(239,68,68,0.3)' :
                       isFog     ? '0 4px 20px rgba(168,85,247,0.3)' :
                       isSafe    ? '0 4px 20px rgba(59,130,246,0.3)' :
                       '0 4px 20px rgba(99,91,255,0.4)'
          }}
        >
          Enter →
        </button>
      </div>
    </div>
  );
}

/* ── Tree Map custom node ────────────────────────────────────────── */
function renderCustomNode({ nodeDatum, toggleNode }, heatmap, currentRoomId, handleTravelTo, user) {
  const roomId = parseInt(nodeDatum.name.replace("Room #", ""));
  const playerCount = heatmap[roomId] || 0;
  const isCurrent = roomId === currentRoomId;
  const isParadox = false; // Hidden to prevent map spoilers
  const sentiment = nodeDatum.attributes?.sentiment || "neutral";
  const complexity = nodeDatum.attributes?.complexity_score ?? 50;
  const isSolved = nodeDatum.attributes?.is_solved;
  const isLeaf = nodeDatum.attributes?.is_leaf;
  const creator = nodeDatum.attributes?.creator || "?";
  const parentRoomId = nodeDatum.attributes?.parent_room_id;

  let fill, stroke, glow;
  if (isCurrent)        { fill = '#ffffff'; stroke = '#ffffff'; glow = 'rgba(255,255,255,0.9)'; }
  else if (isSolved)    { fill = '#1e293b'; stroke = '#334155'; glow = 'rgba(30,41,59,0.4)'; }
  else if (isParadox)   { fill = '#00ff41'; stroke = '#00ff41'; glow = 'rgba(0,255,65,0.9)'; }
  else if (sentiment === 'dark') { fill = '#ef4444'; stroke = '#f87171'; glow = 'rgba(239,68,68,0.9)'; }
  else if (sentiment === 'light'){ fill = '#3b82f6'; stroke = '#60a5fa'; glow = 'rgba(59,130,246,0.9)'; }
  else if (complexity < 40)      { fill = '#a855f7'; stroke = '#c084fc'; glow = 'rgba(168,85,247,0.9)'; }
  else if (isLeaf)               { fill = '#d97706'; stroke = '#f59e0b'; glow = 'rgba(217,119,6,0.6)'; }
  else                           { fill = '#00ffff'; stroke = '#00ffff'; glow = 'rgba(0,255,255,0.8)'; }

  const nodeName = `Door #${roomId}`;
  const labelW = (nodeName.length + (playerCount > 0 ? 5 : 0)) * 7 + 12;

  return (
    <g>
      {playerCount > 0 && (
        <circle r={26 + playerCount * 3} fill="rgba(0,255,255,0.15)" className="pulse-ring" />
      )}
      {(isParadox || sentiment === 'dark') && !isSolved && (
        <circle r={22} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="3 2" style={{ animation: 'pulse 1.5s infinite' }} />
      )}
      {complexity < 40 && !isParadox && !isSolved && (
        <circle r={20} fill="rgba(168,85,247,0.15)" stroke="#c084fc" strokeWidth={1} strokeDasharray="4 2" />
      )}
      <circle
        r={14} fill={fill} stroke={stroke} strokeWidth={2}
        style={{ cursor: 'pointer', filter: `drop-shadow(0px 0px 15px ${glow})` }}
        onClick={() => {
          if (parentRoomId && !isSolved) handleTravelTo(parentRoomId);
          else handleTravelTo(roomId);
        }}
      />
      <rect x={18} y={-12} width={labelW} height={18} rx={5} fill="rgba(15,23,42,0.9)" stroke="rgba(0,255,255,0.4)" strokeWidth={1} />
      <text className="tree-node-text" x={24} dy={1} fontSize={14} fontWeight="700"
            style={{ fill: '#ffffff', stroke: 'none', fontFamily: 'JetBrains Mono' }}>
        {nodeName}{playerCount > 0 && ` 👥${playerCount}`}
      </text>
      {creator && (
        <>
          <rect x={18} y={10} width={(creator.length + 3) * 7} height={15} rx={4}
                fill={isParadox ? 'rgba(0,40,0,0.9)' : sentiment === 'dark' ? 'rgba(40,0,0,0.9)' : complexity < 40 ? 'rgba(40,0,40,0.9)' : 'rgba(3,7,18,0.9)'}
                stroke={isParadox ? '#00ff41' : sentiment === 'dark' ? '#ef4444' : complexity < 40 ? '#c084fc' : '#334155'}
                strokeWidth={0.8} />
          <text x={23} dy={21} fontSize={9}
                style={{ fill: isParadox ? '#00ff41' : sentiment === 'dark' ? '#f87171' : complexity < 40 ? '#c084fc' : '#94a3b8', fontFamily: 'JetBrains Mono', paintOrder: 'stroke' }}
                stroke="#030712" strokeWidth={0.3}>
            {isParadox ? `⊘ ${creator}` : sentiment === 'dark' ? `⚠ ${creator}` : complexity < 40 ? `🌫 ${creator}` : isLeaf ? `⚡ ${creator}` : `· ${creator}`}
          </text>
        </>
      )}
    </g>
  );
}

/* ── Main App ────────────────────────────────────────────────────── */
function About({ onBack, isExiting }) {
  return (
    <div className={`about-page-container ${isExiting ? 'exit' : ''}`}>
      <div className="max-w-[800px] mx-auto px-6 py-20 text-slate-300 font-mono">
        
        <button onClick={onBack} className="badge hover:bg-white/10 transition-colors mb-12 flex items-center gap-2" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
          ← RETURN TO THE MAZE
        </button>

        <h1 className="text-5xl font-display text-white mb-4 tracking-tight">About The Infinite Escape Room</h1>
        <p className="text-sm text-slate-500 uppercase tracking-widest mb-16">Created by Tushar Raghwani</p>

        <section className="mb-16">
          <h2 className="text-2xl text-white font-display mb-6 border-b border-white/10 pb-4">1. The Purpose</h2>
          <p className="leading-relaxed mb-4">
            Welcome to the collective unconscious of the web. This is an infinitely expanding labyrinth where you solve riddles to progress, and if you hit a dead end, you can forge your own doors using AI. The goal? Navigate as deep as possible, solve mysteries, and outsmart the AI and your fellow players.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl text-white font-display mb-6 border-b border-white/10 pb-4">2. The Mechanics</h2>
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-white mb-2">✦ Solving Doors</h3>
              <p className="text-sm leading-relaxed text-slate-400">Read the riddle, type your answer. Our AI checker understands synonyms and concepts, so you don't need the exact word if the meaning is right.</p>
            </div>
            <div>
              <h3 className="text-white mb-2">✦ Forging Doors</h3>
              <p className="text-sm leading-relaxed text-slate-400">At a dead end? Forge a new door! Write a custom riddle or let the AI generate one. If players fail to solve your door, you earn passive points.</p>
            </div>
            <div>
              <h3 className="text-[#a855f7] mb-2">🌫 Fog of War & Complexity</h3>
              <p className="text-sm leading-relaxed text-slate-400">The AI calculates a Complexity Score (0-100) for every door based on the riddle's difficulty. Rooms with a score below 40 are covered in a cognitive "Fog of War" that obscures the UI.</p>
            </div>
            <div>
              <h3 className="text-[#ef4444] mb-2">⚠ Warnings & Themes</h3>
              <p className="text-sm leading-relaxed text-slate-400">The AI analyzes the sentiment of the riddle (Light, Dark, or Neutral). Dark riddles trigger trap warnings. The system also learns from failed players—if many players guess the same wrong answer (a trap), the AI will warn you about it when you enter the room!</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl text-white font-display mb-6 border-b border-white/10 pb-4">3. Paradoxes</h2>
          <p className="leading-relaxed mb-4 text-sm text-slate-400">
            A Paradox is a room containing a logical contradiction that breaks the simulation (e.g., Door #19: "I am a statement that is entirely false. Everything I say is a lie..."). The AI detects these automatically. Solving a paradox grants a massive +20 points bonus, but beware—their solutions are often abstract!
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl text-white font-display mb-6 border-b border-white/10 pb-4">4. Tools of Survival</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-white/10 bg-white/[0.02] rounded-lg">
              <h3 className="text-white text-sm mb-2">The Live Map</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Scroll to the bottom to view the entire maze structure as a node tree. The map highlights the "Heatmap" showing where other players are currently stuck.</p>
            </div>
            <div className="p-4 border border-white/10 bg-white/[0.02] rounded-lg">
              <h3 className="text-white text-sm mb-2">The Leaderboard</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Top 10 players by points. Earn 10 points for solving a door, 25 points for forging a custom door, and bonus points when people fail your doors!</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function App() {
  const [currentRoomId, setCurrentRoomId] = useState(1);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [themeOverride, setThemeOverride] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoGeneratedRiddle, setIsAutoGeneratedRiddle] = useState(false);
  const [newHint, setNewHint] = useState('');
  const [hintDoorId, setHintDoorId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showParadoxAnim, setShowParadoxAnim] = useState(false);
  const [draftAnalysis, setDraftAnalysis] = useState({ sentiment: 'neutral', complexity_score: null, is_paradox: false });

  const [treeData, setTreeData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [mlWarning, setMlWarning] = useState(null);
  const [failureCount, setFailureCount] = useState(0);
  const [anomaly, setAnomaly] = useState(null);

  const [roomEntryTime, setRoomEntryTime] = useState(Date.now());
  const [wrongGuessCount, setWrongGuessCount] = useState(0);
  const [hintsRead, setHintsRead] = useState(0);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('play'); // 'play' | 'forge'

  const [ripples, setRipples] = useState([]);

  const [showAbout, setShowAbout] = useState(false);
  const [aboutExiting, setAboutExiting] = useState(false);

  const handleOpenAbout = () => {
    setAboutExiting(false);
    setShowAbout(true);
  };
  
  const handleCloseAbout = () => {
    setAboutExiting(true);
    setTimeout(() => {
      setShowAbout(false);
      setAboutExiting(false);
    }, 650); // match animation duration
  };

  useEffect(() => {
    const handleClick = (e) => {
      const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() + Math.random() };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1800);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Live draft analysis
  useEffect(() => {
    if (!newQuestion.trim()) {
      setDraftAnalysis({ sentiment: 'neutral', complexity_score: null, is_paradox: false });
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.post(`${API_URL}/analyze`, { text: newQuestion });
        setDraftAnalysis(res.data);
      } catch {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [newQuestion]);

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem('escape_room_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      setCurrentRoomId(parsed.current_room_id || 1);
    }
  }, []);

  // Data polling
  useEffect(() => {
    if (!user) return;
    fetchRoomData(currentRoomId);
    fetchTreeData();
    fetchActivities();
    fetchHeatmap();
    fetchLeaderboard();
    fetchWarnings(currentRoomId);

    const interval = setInterval(() => {
      fetchActivities();
      fetchHeatmap();
      fetchLeaderboard();
    }, 5000);
    const treeInterval = setInterval(fetchTreeData, 10000);
    return () => { clearInterval(interval); clearInterval(treeInterval); };
  }, [currentRoomId, user]);

  // Auto-clear messages
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => { setError(''); setSuccess(''); }, 4000);
    return () => clearTimeout(t);
  }, [error, success]);

  const fetchWarnings = async (roomId) => {
    try {
      const res = await axios.get(`${API_URL}/rooms/${roomId}/warnings`);
      setMlWarning(res.data.warning || null);
      setFailureCount(res.data.total_failures || 0);
    } catch { setMlWarning(null); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/leaderboard`);
      setLeaderboard(res.data);
      if (user) {
        const me = res.data.find(u => u.username === user.username);
        if (me && me.points !== user.points) {
          const updated = { ...user, points: me.points };
          setUser(updated);
          localStorage.setItem('escape_room_user', JSON.stringify(updated));
        }
      }
    } catch {}
  };

  const fetchHeatmap = async () => {
    try {
      const res = await axios.get(`${API_URL}/maze/heatmap`);
      setHeatmap(res.data);
    } catch {}
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/activity`);
      setActivities(res.data);
    } catch {}
  };

  const fetchTreeData = async () => {
    try {
      const res = await axios.get(`${API_URL}/maze/tree`, { params: { username: user?.username } });
      setTreeData(res.data);
    } catch {}
  };

  const fetchRoomData = async (id) => {
    setLoading(true);
    setRoomEntryTime(Date.now());
    setWrongGuessCount(0);
    setHintsRead(0);
    setAnomaly(null);
    try {
      const res = await axios.get(`${API_URL}/rooms/${id}`);
      setRoomData(res.data);
      setGuess('');
      setError('');
    } catch (err) {
      if (err.response?.status === 404 && id === 1) {
        try {
          await axios.post(`${API_URL}/rooms`, {
            parent_room_id: null,
            question: "Welcome to the Infinite Escape Room. I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            answer: "echo",
            creator: "The Architect"
          });
          fetchRoomData(1);
          return;
        } catch {}
      }
      setError("Failed to load room.");
    }
    setLoading(false);
  };

  const handleSolve = async (doorId, submittedGuess) => {
    try {
      const timeTaken = (Date.now() - roomEntryTime) / 1000;
      const res = await axios.post(`${API_URL}/rooms/${doorId}/solve`, {
        guess: submittedGuess || guess, username: user?.username,
        time_taken: timeTaken,
        wrong_guesses: wrongGuessCount,
        hints_read: hintsRead
      });
      if (res.data.success) {
        const solvedDoor = roomData.doors.find(d => d.id === doorId);
        const pts = res.data.points_gained ?? (res.data.points_awarded ? 10 : 0);
        const updated = { ...user, current_room_id: doorId, points: (user.points || 0) + pts };
        setUser(updated);
        localStorage.setItem('escape_room_user', JSON.stringify(updated));

        const finalizeSolve = () => {
          setCurrentRoomId(res.data.new_room_id);
          setAnomaly(null);
          setMlWarning(null);
          setFailureCount(0);
          if (!res.data.points_awarded) {
            setSuccess('✓ Correct! (Room already solved — no bonus this time)');
          } else {
            setSuccess(`✓ Correct! +${pts} pts`);
          }
        };

        if (solvedDoor && solvedDoor.is_paradox) {
          setShowParadoxAnim(true);
          setTimeout(() => {
            setShowParadoxAnim(false);
            finalizeSolve();
          }, 3500);
        } else {
          finalizeSolve();
        }
      } else {
        setWrongGuessCount(p => p + 1);
        setError('Incorrect answer. Try again or pick another door.');
        if (res.data.anomaly) {
          setAnomaly(res.data.anomaly);
          if (res.data.anomaly.hint_injected) fetchRoomData(currentRoomId);
        }
        fetchWarnings(doorId);
      }
    } catch { setError("Connection error."); }
  };

  const handleCreateDoor = async (e) => {
    e.preventDefault();
    if ((user?.points || 0) < 50) { setError("Need 50 pts to forge."); return; }
    try {
      await axios.post(`${API_URL}/rooms`, {
        parent_room_id: currentRoomId,
        question: newQuestion,
        answer: newAnswer,
        creator: user?.username || "Anonymous",
        theme_override: themeOverride || null,
        is_auto_generated: isAutoGeneratedRiddle
      });
      setNewQuestion(''); setNewAnswer(''); setThemeOverride(''); setIsAutoGeneratedRiddle(false);
      
      const pts_earned = isAutoGeneratedRiddle ? 0 : 25;
      if (pts_earned > 0) {
        const updated = { ...user, points: (user.points || 0) + pts_earned };
        setUser(updated);
        localStorage.setItem('escape_room_user', JSON.stringify(updated));
        setSuccess(`✓ New door forged! +${pts_earned} pts`);
      } else {
        setSuccess('✓ AI door summoned! (No points awarded)');
      }
      
      fetchRoomData(currentRoomId);
      setActiveTab('play');
    } catch { setError("Failed to create door."); }
  };

  const handleGenerateRiddle = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.get(`${API_URL}/riddles/generate`);
      if (res.data.question) {
        setNewQuestion(res.data.question);
        setNewAnswer(res.data.answer);
        setIsAutoGeneratedRiddle(true);
      } else {
        setError(res.data.message || "No riddles available.");
      }
    } catch { setError("Failed to generate riddle."); }
    setIsGenerating(false);
  };

  const handleAddHint = async (e) => {
    e.preventDefault();
    const prefix = hintDoorId ? `[Door #${hintDoorId}] ` : '';
    try {
      await axios.post(`${API_URL}/rooms/${currentRoomId}/hints`, {
        message: prefix + newHint, creator: user?.username
      });
      setNewHint('');
      setHintsRead(p => p + 1);
      fetchRoomData(currentRoomId);
    } catch (err) {
      setError('Failed to leave hint.');
    }
  };

  const handleTravelBack = async (parentId) => {
    try {
      await axios.post(`${API_URL}/users/${user.username}/move?room_id=${parentId}`);
      setCurrentRoomId(parentId);
      const updated = { ...user, current_room_id: parentId };
      setUser(updated);
      localStorage.setItem('escape_room_user', JSON.stringify(updated));
    } catch {}
  };

  const handleTravelTo = async (roomId) => {
    try {
      await axios.post(`${API_URL}/users/${user.username}/move?room_id=${roomId}`);
      setCurrentRoomId(roomId);
      const updated = { ...user, current_room_id: roomId };
      setUser(updated);
      localStorage.setItem('escape_room_user', JSON.stringify(updated));
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    setRoomData(null);
    localStorage.removeItem('escape_room_user');
  };

  /* ── Auth Gate ── */
  if (!user) return <AuthScreen onLogin={(u) => {
    setUser(u);
    setCurrentRoomId(u.current_room_id || 1);
    localStorage.setItem('escape_room_user', JSON.stringify(u));
  }} />;

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(99,91,255,0.2)',
        borderTopColor: '#635bff',
        animation: 'spin-border 0.8s linear infinite'
      }} />
      <p style={{ color: '#475569', fontSize: 14, fontFamily: 'JetBrains Mono' }}>Traversing the maze...</p>
    </div>
  );

  if (!roomData) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>Error loading maze.</p>
    </div>
  );

  // Apply theme to body
  document.body.className = `theme-${roomData.sentiment || 'neutral'}`;

  const isDeadEnd = roomData.doors.length === 0;
  const sentiment = roomData.sentiment || 'neutral';
  const isParadox = roomData.is_paradox;
  const isFog = roomData.complexity_score < 40;

  return (
    <>
      {ripples.map(r => (
        <div key={r.id} className="water-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    <div onMouseMove={(e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    }}>
      {/* Fog of war */}
      {isFog && <div className="fog-overlay" />}
      
      {/* Subtle v0 Grid */}
      <HeroGrid />
    <div className="bg-black text-white min-h-screen">
      {/* ML status badges */}
      <div className="ml-badge-stack fixed top-20 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {[
          { show: true, label: `VIBE: ${sentiment.toUpperCase()}`, color: sentiment === 'dark' ? '#ef4444' : sentiment === 'light' ? '#3b82f6' : '#475569' },
          { show: true, label: `COMPLEXITY: ${Math.round(roomData.complexity_score)}${isFog ? ' 🌫' : ''}`, color: isFog ? '#a855f7' : '#475569' },
          { show: false, label: '⊘ PARADOX', color: '#00ff41' },
        ].filter(b => b.show).map(b => (
          <div key={b.label} style={{
            fontSize: 10, padding: '4px 12px', borderRadius: 100,
            background: 'rgba(3,7,18,0.9)', border: `1px solid ${b.color}40`,
            color: b.color, fontFamily: 'JetBrains Mono', fontWeight: 700,
            letterSpacing: '0.06em', backdropFilter: 'blur(10px)',
            animation: b.label.includes('PARADOX') ? 'pulse 1.5s infinite' : 'none'
          }}>
            {b.label}
          </div>
        ))}
      </div>

      {/* ML Warning & Stats (Behavioral Analysis) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        {mlWarning && (
          <div className="relative bg-black/80 backdrop-blur-md px-5 py-4 rounded-xl border border-red-500/40 flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse pr-10">
            <button onClick={() => setMlWarning(null)} className="absolute top-2 right-2 text-red-500/50 hover:text-red-400">
              ✕
            </button>
            <span className="text-red-400 text-xl">⚠</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1">Behavioral ML Warning</span>
              <span className="text-sm font-semibold">{mlWarning}</span>
            </div>
          </div>
        )}
        {failureCount > 5 && (
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-[#fbbf24]/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <span className="text-yellow-400">⚰</span>
            <span className="text-xs font-mono text-slate-300">Graveyard: {failureCount} failures here</span>
          </div>
        )}
      </div>

      {/* ── Section 1: Room Hero (Features Section) ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="relative mb-12">
            <div className="grid lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-3 text-sm font-mono text-slate-500 mb-6">
                  <span className="w-12 h-px bg-white/20" />
                  The Maze
                </span>
                <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] text-white">
                  Room <span className="text-white/40">#{roomData.id}.</span>
                </h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
                  {isParadox && <Badge variant="paradox">⊘ Paradox Room</Badge>}
                  {sentiment === 'dark' && !isParadox && <Badge variant="trap">⚠ Trap Vibe</Badge>}
                  {sentiment === 'light' && !isParadox && <Badge variant="safe">✓ Safe Vibe</Badge>}
                  {isFog && !isParadox && <Badge variant="fog">🌫 Fog Active</Badge>}
                  {isDeadEnd && <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>⚡ Dead End</span>}
                  
                  {roomData.parent_room_id && (
                    <button onClick={() => setCurrentRoomId(roomData.parent_room_id)} className="badge hover:bg-white/10 transition-colors" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                      ← Go Back to Room #{roomData.parent_room_id}
                    </button>
                  )}
                </div>
              </div>
              <div className="lg:col-span-4 lg:pb-4">
                <p className="text-xl text-slate-400 leading-relaxed">
                  Crafted by <span className="text-white font-medium">{roomData.creator}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 relative bg-black border border-white/10 min-h-[500px] overflow-hidden group flex">
              <div className="relative flex-1 p-8 lg:p-12 bg-black">
                <div className="relative z-10 flex flex-col h-full justify-center">
                  <span className="font-mono text-sm text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    🔑 The riddle you solved to enter
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-display mt-6 mb-6 leading-relaxed italic text-white/90">
                    "{roomData.question}"
                  </h3>
                  {isParadox && (
                    <div className="mt-4 p-3 rounded-lg text-xs font-mono text-[#00ff41] bg-[#00ff41]/5 border border-[#00ff41]/20 inline-block w-fit">
                      [CRITICAL ERROR: Logical Contradiction Detected — This room is unstable]
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden lg:block relative w-[42%] shrink-0 overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2812%29-ng3RrNnsPMJ5CrtOjcPTmhHg01W11q.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Metrics (Stats Section) ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="mb-20">
            <h2 className="text-6xl md:text-7xl lg:text-[100px] font-display tracking-tight leading-[0.9] text-white">
              Real-time
              <br />
              <span className="text-white/40">agent metrics.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/10 p-10 lg:p-14">
              <div className="text-5xl lg:text-7xl tracking-tight mb-4 whitespace-nowrap overflow-hidden text-white">
                {user.points || 0}
              </div>
              <div className="text-lg text-white mb-2">Total Points</div>
              <div className="text-sm text-slate-500 font-mono">earned navigating the maze</div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between gap-6">
              <div className="w-full">
                <div className="text-sm text-slate-500 font-mono mb-2">current depth</div>
                <div className="text-base text-white mb-3">Distance to Origin</div>
              </div>
              <div className="text-4xl lg:text-5xl tracking-tight text-white">
                {roomData.distance_to_edge} doors
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between gap-6">
              <div className="w-full">
                <div className="text-sm text-slate-500 font-mono mb-2">available paths</div>
                <div className="text-base text-white mb-3">Doors Ahead</div>
              </div>
              <div className="text-4xl lg:text-5xl tracking-tight text-white">
                {roomData.doors.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Action & Navigation (Infrastructure Section) ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="mb-20">
            <span className="inline-flex items-center gap-4 text-sm font-mono text-slate-500 mb-8">
              <span className="w-12 h-px bg-white/20" />
              Navigation controls
            </span>
            <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-stretch">
              <div className="flex flex-col justify-center">
                <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] text-white">
                  Forge your
                  <br />
                  <span className="text-white/40">own path.</span>
                </h2>
                <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-lg">
                  Navigate the labyrinth by solving riddles, or blaze a new trail by forging a door for future agents.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="relative p-8 lg:p-12 border border-white/10 bg-white/[0.02]">
              <div className="relative z-10 grid lg:grid-cols-2 gap-12">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl lg:text-7xl font-display leading-none text-white">⚒ Forge</span>
                    <span className="text-xl text-slate-400">a new door</span>
                  </div>
                  <p className="text-slate-400 max-w-md mb-8">
                    {isDeadEnd
                      ? "You've reached a dead end. Leave your legacy — build a riddle for future explorers."
                      : "Can't solve the existing riddles? Forge a brand new branching path."}
                  </p>

                  {roomData.doors.filter(d => d.creator === user?.username).length >= 2 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center border border-red-500/30 bg-red-500/5 rounded-xl">
                      <span className="text-4xl mb-4">⛔</span>
                      <span className="text-xl font-display text-white mb-2">Personal Capacity Reached</span>
                      <span className="text-slate-400">You have already forged 2 doors from this room. Give others a chance to branch out!</span>
                    </div>
                  ) : (
                    <form autoComplete="off" onSubmit={handleCreateDoor} className="flex flex-col gap-4 max-w-lg bg-black/60 p-6 rounded-xl border border-white/10 backdrop-blur-md">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2">Your Riddle</label>
                    <textarea
                      required value={newQuestion}
                      onChange={e => { setNewQuestion(e.target.value); setIsAutoGeneratedRiddle(false); }}
                      placeholder="I speak without a mouth and hear without ears..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2">Answer (Secret Key)</label>
                      <input
                        type="text" autoComplete="off" required value={newAnswer}
                        onChange={e => { setNewAnswer(e.target.value); setIsAutoGeneratedRiddle(false); }}
                        placeholder="e.g. sound, echo, noise"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      />
                      <p className="text-[10px] text-slate-500 mt-2 font-mono">You can provide multiple answers separated by commas.</p>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2">Door Theme</label>
                      <select value={themeOverride} onChange={e => setThemeOverride(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30">
                        <option className="bg-slate-900" value="">Auto-Detect (AI)</option>
                        <option className="bg-slate-900" value="neutral">Neutral (Standard)</option>
                        <option className="bg-slate-900" value="light">Light (Positive)</option>
                        <option className="bg-slate-900" value="dark">Dark (Ominous)</option>
                        <option className="bg-slate-900" value="fog">Fog of War (Complex)</option>
                        <option className="bg-slate-900" value="paradox">Paradox (Logic Loop)</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={handleGenerateRiddle} disabled={loading || isGenerating} className="btn-secondary w-full mt-2 py-2 text-sm font-display tracking-wide border border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    {isGenerating ? '✨ Generating...' : '✨ Auto-Generate with AI'}
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-lg font-display tracking-wide">
                    {loading ? 'Forging...' : 'Build Door'}
                  </button>
                </form>
                )}
                </div>

                <div className="flex flex-col pt-8 lg:pt-0 lg:pl-12 lg:border-l border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-display text-white">Echoes (Chat)</h3>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{roomData.hints?.length || 0}</span>
                  </div>
                  
                  <div className="overflow-y-auto pr-2 flex flex-col gap-3 mb-4 h-[300px]">
                    {!roomData.hints?.length ? (
                      <div className="text-slate-500 font-mono text-xs italic">No echoes in this room yet.</div>
                    ) : (
                      roomData.hints.map(hint => (
                        <div key={hint.id} className="p-3 border border-white/10 bg-white/[0.02] rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{hint.creator}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(hint.created_at + "Z").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{hint.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddHint} className="flex gap-2">
                    <select
                      value={hintDoorId}
                      onChange={(e) => setHintDoorId(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                    >
                      <option className="bg-slate-900 text-white" value="">General</option>
                      {roomData.doors.map(d => (
                        <option className="bg-slate-900 text-white" key={d.id} value={d.id}>Door #{d.id}</option>
                      ))}
                    </select>
                    <input
                      type="text" required value={newHint}
                      onChange={e => setNewHint(e.target.value)}
                      placeholder="Leave a hint..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                    <button type="submit" className="btn-primary px-4 py-2 text-sm">Send</button>
                  </form>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isDeadEnd ? (
                <div className="md:col-span-2 lg:col-span-3 p-8 border border-[#fbbf24]/30 bg-[#fbbf24]/5 flex flex-col justify-center items-center h-full text-center">
                  <span className="text-6xl mb-4">⚡</span>
                  <span className="text-2xl font-display text-[#fbbf24]">Dead End</span>
                  <span className="text-slate-400 mt-2">No doors ahead. You must forge a new one to continue.</span>
                </div>
              ) : (
                roomData.doors.map(door => {
                  const isParadox = false; // Hidden to prevent spoilers
                  const isTrap    = door.sentiment === 'dark' && !door.is_paradox;
                  const isSafe    = door.sentiment === 'light' && !door.is_paradox && door.complexity_score >= 40;
                  const isFog     = door.complexity_score < 40 && !door.is_paradox;
                  
                  return (
                    <div key={door.id} className={`p-6 border bg-white/[0.02] flex flex-col gap-4 transition-all hover:bg-white/[0.04] ${isTrap ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : isFog ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : isSafe ? 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : isParadox ? 'border-green-500/30 shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-mono text-slate-500 block">Door #{door.id}</span>
                        </div>
                        {(isTrap || isFog || isSafe || isParadox) && (
                          <div className={`text-[10px] font-mono px-3 py-2 rounded mb-4 border ${isParadox ? 'bg-green-500/10 text-green-400 border-green-500/20' : isTrap ? 'bg-red-500/10 text-red-400 border-red-500/20' : isFog ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            {isParadox && '⊘ CORE ERROR: LOGICAL CONTRADICTION · +20 PTS BONUS'}
                            {isTrap    && '⚠ WARNING: HOSTILE ATMOSPHERE · HIGH DIFFICULTY'}
                            {isFog     && '🌫 COGNITIVE HAZARD: FOG OF WAR ACTIVE'}
                            {isSafe    && '✓ STABLE NODE: SAFE ENTRY RECOMMENDED'}
                          </div>
                        )}
                        <p className={`text-base leading-relaxed ${isParadox ? 'font-mono text-green-400 glitch-effect' : 'text-slate-300'}`}>
                          "{door.question}"
                        </p>
                      </div>
                      
                      <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleSolve(door.id, e.target.elements.guess.value); }} className="flex gap-2">
                        <input
                          type="text"
                          name="guess"
                          autoComplete="off"
                          required
                          placeholder={isTrap ? 'Tread carefully...' : isFog ? 'Analyze carefully...' : 'Your answer...'}
                          className="flex-1 bg-black border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-white/30"
                          style={{ borderColor: isParadox ? 'rgba(0,255,65,0.3)' : isTrap ? 'rgba(239,68,68,0.3)' : isFog ? 'rgba(168,85,247,0.3)' : isSafe ? 'rgba(59,130,246,0.3)' : undefined }}
                        />
                        <button type="submit" className="btn-primary py-2 px-4 text-sm font-mono">Unlock</button>
                      </form>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Paradox Animation Overlay ── */}
      {showParadoxAnim && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl pointer-events-none">
          <div className="text-[#00ff41] font-mono text-center px-4">
            <h1 className="text-4xl md:text-7xl font-bold mb-6 glitch-effect animate-pulse tracking-widest uppercase">Paradox Resolved</h1>
            <h2 className="text-xl md:text-2xl tracking-widest opacity-80 uppercase border-y border-[#00ff41]/30 py-4 inline-block">Logical Anomaly Stabilized</h2>
            <div className="mt-12 text-xs md:text-sm opacity-60 animate-pulse tracking-widest">Initializing spatial reconfiguration...</div>
          </div>
        </div>
      )}

      {/* ── Top Nav / Status Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center mix-blend-difference pointer-events-none w-full">
        <div className="font-display font-bold text-xl tracking-widest text-white uppercase flex items-center gap-3 shrink-0">
          <span className="opacity-50 pointer-events-auto cursor-pointer" onClick={() => handleTravelTo(1)}>Escape</span>
          <span className="opacity-100">Room</span>
        </div>

        {/* Live pulse ticker */}
        <div className="flex-1 overflow-hidden relative mx-8 pointer-events-auto hidden md:block">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
              <span className="text-[10px] text-white uppercase font-mono tracking-widest">LIVE</span>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="animate-marquee flex gap-16 whitespace-nowrap">
                {[...activities, ...activities].map((act, i) => (
                  <span key={i} className="text-xs text-slate-400 font-mono">
                    {act.message}
                    <span className="text-slate-600 ml-3">
                      [{new Date(act.created_at + "Z").toLocaleTimeString()}]
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Global Error Banner */}
        {error && (
          <div className="pointer-events-auto absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-lg flex items-center gap-3 backdrop-blur-md z-50 animate-pulse cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]" onClick={() => setError('')}>
            <span>⚠</span> {error}
          </div>
        )}

        <div className="flex items-center gap-6 pointer-events-auto">
          {user && (
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Log Out
            </button>
          )}
        </div>
      </nav>

      {/* ── Section 4: Live Map & Leaderboard ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 grid lg:grid-cols-4 gap-12">
          
          {/* Left Column: Leaderboard & Chat */}
          <div className="lg:col-span-1 flex flex-col gap-12">
            <div>
              <h3 className="text-3xl font-display text-white mb-6">Leaderboard</h3>
              <div className="flex flex-col gap-3">
                {leaderboard.slice(0, 10).map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-xs">{(i+1).toString().padStart(2, '0')}</span>
                      <span className={`font-mono text-sm ${u.username === user.username ? 'text-white font-bold' : 'text-slate-300'}`}>{u.username}</span>
                    </div>
                    <span className="text-white font-display text-lg">{u.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column: Interactive Map */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-display text-white">Global Maze Structure</h3>
                <p className="text-slate-500 text-sm font-mono mt-1">Live tracking of all active agents</p>
              </div>
              <div className="flex gap-4 flex-wrap bg-white/5 p-2 rounded-xl border border-white/10">
                {[
                  { color: '#ffffff', label: 'You are here' },
                  { color: '#635bff', label: 'Unsolved' },
                  { color: '#ef4444', label: 'Trap' },
                  { color: '#a855f7', label: 'Fog' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2 text-xs font-mono text-white">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden relative h-[800px]"
                 style={{ background: 'radial-gradient(ellipse at bottom, #062233 0%, #020617 80%)' }}>
              <Orb color="radial-gradient(rgba(0,255,255,0.15), transparent)" size="800px" x="50%" y="80%" opacity={0.3} />
              
              <div className="absolute inset-0 z-10">
                {treeData.length > 0 ? (
                  <Tree
                    data={treeData}
                    orientation="vertical"
                    pathFunc="diagonal"
                    translate={{ x: Math.min(window.innerWidth * 0.75, 1000) / 2, y: 50 }}
                    nodeSize={{ x: 260, y: 160 }}
                    renderCustomNodeElement={(props) => renderCustomNode(props, heatmap, currentRoomId, handleTravelTo, user)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 font-mono">Loading coordinate data...</div>
                )}
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer Link */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-12 pt-8 border-t border-white/5 flex justify-center pb-12 relative z-10">
          <button onClick={handleOpenAbout} className="text-sm font-mono text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
            About the Maze
          </button>
        </div>
      </section>

      {showAbout && <About onBack={handleCloseAbout} isExiting={aboutExiting} />}
      
      </div>
    </div>
    </>
  );
}

export default App;
