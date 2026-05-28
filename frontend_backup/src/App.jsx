import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree';

const API_URL = "http://localhost:8000/api";

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
  <div className="glass rounded-2xl p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
         style={{ background: `${accent}25`, color: accent }}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</div>
      <div className="stat-num text-white text-lg leading-tight">{value}</div>
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
    <div className="auth-page">
      {/* Ambient orbs */}
      <Orb color="radial-gradient(#635bff, transparent)" size="500px" x="-10%" y="-20%" opacity={0.25} />
      <Orb color="radial-gradient(#0a2540, transparent)" size="400px" x="70%" y="60%" opacity={0.3} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #635bff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 8px 24px rgba(99,91,255,0.5)'
            }}>🔮</div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, color: 'white' }}>
              MAZE TERMINAL
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? 'Welcome back. Resume your progress.' : 'Create an account to begin your journey.'}
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-8" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 mb-8 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={mode === m ? {
                  background: 'linear-gradient(135deg, #635bff, #7c3aed)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(99,91,255,0.4)'
                } : { background: 'transparent', color: '#64748b' }}
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input
                required type="text" value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field"
                placeholder="your_handle"
                id="auth-username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                required type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                id="auth-password"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ padding: '14px', fontSize: 15 }}
              id="auth-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin-border 0.6s linear infinite' }} />
                  Authenticating...
                </span>
              ) : (mode === 'login' ? '→ Enter the Maze' : '→ Begin Journey')}
            </button>
          </form>

          <div className="text-center mt-6" style={{ color: '#475569', fontSize: 13 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
              style={{ color: '#a78bfa', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {['🧠 AI Analysis', '🌫 Fog of War', '⊘ Paradox Detection', '🗺 Live Map'].map(f => (
            <div key={f} className="text-[11px] text-slate-500 px-3 py-1 rounded-full mono"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Topbar ─────────────────────────────────────────────────────── */
function Topbar({ user, activities, onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(3,7,18,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 32px',
      height: 64,
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #635bff, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
        }}>🔮</div>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>Maze Terminal</span>
      </div>

      {/* Live pulse ticker */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>LIVE</span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="animate-marquee" style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
              {[...activities, ...activities].map((act, i) => (
                <span key={i} style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                  {act.message}
                  <span style={{ color: '#1e293b', marginLeft: 12 }}>
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
          background: 'linear-gradient(135deg, #635bff20, #a78bfa20)',
          border: '1px solid rgba(99,91,255,0.3)',
          borderRadius: 100, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, #635bff, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{user.username}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', fontFamily: 'Space Grotesk' }}>{user.points || 0} pts</span>
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
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Leaderboard</span>
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
  const isParadox = nodeDatum.attributes?.is_paradox;
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
  else                           { fill = '#635bff'; stroke = '#818cf8'; glow = 'rgba(99,91,255,0.8)'; }

  const labelW = (nodeDatum.name.length + (playerCount > 0 ? 5 : 0)) * 7 + 12;

  return (
    <g>
      {playerCount > 0 && (
        <circle r={26 + playerCount * 3} fill="rgba(99,91,255,0.1)" className="pulse-ring" />
      )}
      {(isParadox || sentiment === 'dark') && !isSolved && (
        <circle r={22} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="3 2" style={{ animation: 'pulse 1.5s infinite' }} />
      )}
      {complexity < 40 && !isParadox && !isSolved && (
        <circle r={20} fill="rgba(168,85,247,0.15)" stroke="#c084fc" strokeWidth={1} strokeDasharray="4 2" />
      )}
      <circle
        r={14} fill={fill} stroke={stroke} strokeWidth={2}
        style={{ cursor: 'pointer', filter: `drop-shadow(0px 0px 10px ${glow})` }}
        onClick={() => {
          if (parentRoomId && !isSolved) handleTravelTo(parentRoomId);
          else handleTravelTo(roomId);
        }}
      />
      <rect x={18} y={-12} width={labelW} height={18} rx={5} fill="rgba(3,7,18,0.9)" />
      <text fill="#e2e8f0" x={24} dy={3} fontSize={11} fontWeight="600"
            style={{ fontFamily: 'JetBrains Mono', paintOrder: 'stroke' }}
            stroke="#030712" strokeWidth={0.5}>
        {nodeDatum.name}{playerCount > 0 && ` 👥${playerCount}`}
      </text>
      {creator && (
        <>
          <rect x={18} y={10} width={(creator.length + 3) * 7} height={15} rx={4}
                fill={isParadox ? 'rgba(0,40,0,0.9)' : 'rgba(3,7,18,0.9)'}
                stroke={isParadox ? '#00ff41' : sentiment === 'dark' ? '#ef4444' : '#334155'}
                strokeWidth={0.8} />
          <text fill={isParadox ? '#00ff41' : '#94a3b8'} x={23} dy={22} fontSize={9}
                style={{ fontFamily: 'JetBrains Mono', paintOrder: 'stroke' }}
                stroke="#030712" strokeWidth={0.3}>
            {isParadox ? `⊘ ${creator}` : isLeaf ? `⚡ ${creator}` : `· ${creator}`}
          </text>
        </>
      )}
    </g>
  );
}

/* ── Main App ────────────────────────────────────────────────────── */
function App() {
  const [currentRoomId, setCurrentRoomId] = useState(1);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [hiddenAnswer, setHiddenAnswer] = useState('');
  const [draftAnalysis, setDraftAnalysis] = useState({ sentiment: 'neutral', complexity_score: null, is_paradox: false });

  const [newHint, setNewHint] = useState('');
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

  const handleSolve = async (doorId) => {
    try {
      const timeTaken = (Date.now() - roomEntryTime) / 1000;
      const res = await axios.post(`${API_URL}/rooms/${doorId}/solve`, {
        guess, username: user?.username,
        time_taken: timeTaken,
        wrong_guesses: wrongGuessCount,
        hints_read: hintsRead
      });
      if (res.data.success) {
        setCurrentRoomId(res.data.new_room_id);
        setAnomaly(null);
        setMlWarning(null);
        setFailureCount(0);
        const pts = res.data.points_gained ?? (res.data.points_awarded ? 10 : 0);
        const updated = { ...user, current_room_id: doorId, points: (user.points || 0) + pts };
        setUser(updated);
        localStorage.setItem('escape_room_user', JSON.stringify(updated));
        if (!res.data.points_awarded) {
          setSuccess('✓ Correct! (Room already solved — no bonus this time)');
        } else {
          setSuccess(`✓ Correct! +${pts} pts`);
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
    try {
      await axios.post(`${API_URL}/rooms`, {
        parent_room_id: currentRoomId,
        question: newQuestion,
        answer: hiddenAnswer || newAnswer,
        creator: user?.username || "Anonymous"
      });
      setNewQuestion(''); setNewAnswer(''); setHiddenAnswer('');
      const updated = { ...user, points: (user.points || 0) + 25 };
      setUser(updated);
      localStorage.setItem('escape_room_user', JSON.stringify(updated));
      setSuccess('✓ New door forged! +25 pts');
      fetchRoomData(currentRoomId);
      setActiveTab('play');
    } catch { setError("Failed to create door."); }
  };

  const handleGenerateRiddle = async () => {
    try {
      const res = await axios.get(`${API_URL}/riddles/generate`);
      if (res.data.question) {
        setNewQuestion(res.data.question);
        setNewAnswer('••••••••');
        setHiddenAnswer(res.data.answer);
      } else {
        setError(res.data.message || "No riddles available.");
      }
    } catch { setError("Failed to generate riddle."); }
  };

  const handleAddHint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/rooms/${currentRoomId}/hints`, {
        creator: user?.username || "Anonymous",
        message: newHint
      });
      setNewHint('');
      setHintsRead(p => p + 1);
      fetchRoomData(currentRoomId);
    } catch { setError("Failed to post message."); }
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
    <div onMouseMove={(e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    }}>
      {/* Fog of war */}
      {isFog && <div className="fog-overlay" />}

      {/* ML status badges */}
      <div className="ml-badge-stack">
        {[
          { show: true, label: `VIBE: ${sentiment.toUpperCase()}`, color: sentiment === 'dark' ? '#ef4444' : sentiment === 'light' ? '#3b82f6' : '#475569' },
          { show: true, label: `COMPLEXITY: ${Math.round(roomData.complexity_score)}${isFog ? ' 🌫' : ''}`, color: isFog ? '#a855f7' : '#475569' },
          { show: isParadox, label: '⊘ PARADOX', color: '#00ff41' },
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

      {/* Topbar */}
      <Topbar user={user} activities={activities} onLogout={handleLogout} />

      {/* Main layout */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left sidebar ── */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 96 }}>
          {/* Stats */}
          <StatCard icon="🏠" label="Current Room" value={`#${roomData.id}`} accent="#635bff" />
          <StatCard icon="🚪" label="Doors Ahead" value={roomData.doors.length} accent="#0ea5e9" />
          <StatCard icon="🧭" label="Depth" value={`${roomData.distance_to_edge} doors`} accent="#8b5cf6" />
          <StatCard icon="⭐" label="Your Points" value={user.points || 0} accent="#f59e0b" />

          {/* Leaderboard */}
          <Leaderboard entries={leaderboard} currentUser={user.username} />
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Room header */}
          <div className="glass-strong rounded-3xl overflow-hidden" style={{ padding: '32px', position: 'relative' }}>
            {/* Ambient orbs inside card */}
            <Orb color={sentiment === 'dark' ? 'radial-gradient(#ef4444, transparent)' : sentiment === 'light' ? 'radial-gradient(#3b82f6, transparent)' : 'radial-gradient(#635bff, transparent)'}
                 size="300px" x="-10%" y="-30%" opacity={0.15} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                {roomData.parent_room_id && (
                  <button onClick={() => handleTravelBack(roomData.parent_room_id)} className="btn-ghost"
                          style={{ padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ← Back
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                  <span>The Maze</span>
                  <span>/</span>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>Room #{roomData.id}</span>
                </div>
              </div>

              {/* Room title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
                    Room #{roomData.id}
                  </h1>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>
                    Crafted by <span style={{ color: '#94a3b8', fontWeight: 600 }}>{roomData.creator}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {isParadox && <Badge variant="paradox">⊘ Paradox Room</Badge>}
                  {sentiment === 'dark' && !isParadox && <Badge variant="trap">⚠ Trap Vibe</Badge>}
                  {sentiment === 'light' && !isParadox && <Badge variant="safe">✓ Safe Vibe</Badge>}
                  {isFog && !isParadox && <Badge variant="fog">🌫 Fog Active</Badge>}
                  {isDeadEnd && <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.4)', color: '#fcd34d' }}>⚡ Dead End</span>}
                </div>
              </div>

              {/* The riddle you solved */}
              <div style={{ marginTop: 24, padding: 24, borderRadius: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🔑</span> The riddle you solved to enter
                </div>
                {isParadox ? (
                  <div className="glitch-effect" data-text={`"${roomData.question}"`}
                       style={{ fontSize: 18, lineHeight: 1.7 }}>
                    "{roomData.question}"
                  </div>
                ) : (
                  <p style={{ fontSize: 18, color: '#e2e8f0', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                    "{roomData.question}"
                  </p>
                )}
                {isParadox && (
                  <div style={{
                    marginTop: 12, padding: '8px 12px', borderRadius: 8, fontSize: 11,
                    fontFamily: 'JetBrains Mono', color: '#00ff41', fontWeight: 700,
                    background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)'
                  }}>
                    [CRITICAL ERROR: Logical Contradiction Detected — This room is unstable]
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification bar */}
          {(error || success) && (
            <div style={{
              padding: '14px 18px', borderRadius: 12, fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 10,
              background: error ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: error ? '#fca5a5' : '#86efac',
              animation: 'fadeIn 0.3s ease'
            }}>
              <span>{error || success}</span>
            </div>
          )}

          {/* ML warning */}
          {mlWarning && (
            <div className="glass rounded-2xl" style={{
              padding: '16px 20px', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>🧠</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Collective Unconscious · {failureCount} failures recorded
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', fontFamily: 'JetBrains Mono', lineHeight: 1.6 }}>⚠ {mlWarning}</p>
              </div>
            </div>
          )}

          {/* Anomaly */}
          {anomaly && (
            <div className="glass rounded-2xl" style={{
              padding: '16px 20px',
              border: `1px solid ${anomaly.type === 'speed_runner' ? 'rgba(251,191,36,0.3)' : anomaly.type === 'stuck' ? 'rgba(59,130,246,0.3)' : 'rgba(168,85,247,0.3)'}`,
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>
                {anomaly.type === 'speed_runner' ? '⚡' : anomaly.type === 'stuck' ? '🌀' : '👁'}
              </span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                              color: anomaly.type === 'speed_runner' ? '#fbbf24' : anomaly.type === 'stuck' ? '#60a5fa' : '#c084fc' }}>
                  Trap Predictor · Anomaly Score: {anomaly.score?.toFixed(3)}
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>{anomaly.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{anomaly.detail}</p>
                {anomaly.hint_injected && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#60a5fa', fontFamily: 'JetBrains Mono' }}>
                    🤖 AI injected a hint — check the chat panel!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation tabs */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'play',  label: `🚪 Doors (${roomData.doors.length})` },
              { id: 'forge', label: '⚒ Forge Door' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}
                style={{
                  flex: 1, borderRadius: 10, padding: '10px',
                  fontSize: 13, fontWeight: 600,
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #635bff, #7c3aed)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99,91,255,0.4)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                id={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'play' && (
            <div>
              {isDeadEnd ? (
                <div className="glass rounded-3xl" style={{ padding: 40, textAlign: 'center', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Dead End Reached</h2>
                  <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 24px' }}>You've reached the edge of the known maze. Forge a new path to extend it!</p>
                  <button className="btn-primary" onClick={() => setActiveTab('forge')} style={{ padding: '12px 28px' }}>
                    ⚒ Forge New Door
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                  {roomData.doors.map(door => (
                    <DoorCard key={door.id} door={door} guess={guess} setGuess={setGuess} onSolve={handleSolve} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'forge' && (
            <div className="glass-strong rounded-3xl" style={{ padding: 32, border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
              <Orb color="radial-gradient(#635bff, transparent)" size="300px" x="60%" y="-20%" opacity={0.1} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>
                  ⚒ Forge a New Door
                </h2>
                <p style={{ color: '#475569', fontSize: 15, margin: '0 0 28px', lineHeight: 1.6 }}>
                  {isDeadEnd
                    ? "You've reached a dead end. Leave your legacy — build a riddle for future explorers."
                    : "Can't solve the existing riddles? Forge a brand new branching path."}
                </p>

                <form onSubmit={handleCreateDoor} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Riddle</label>
                      <button type="button" onClick={handleGenerateRiddle}
                        className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✨ Auto-Generate
                      </button>
                    </div>
                    <textarea
                      required value={newQuestion}
                      onChange={e => {
                        setNewQuestion(e.target.value);
                        if (newAnswer === '••••••••') { setNewAnswer(''); setHiddenAnswer(''); }
                      }}
                      className="input-field"
                      rows={4}
                      style={{ resize: 'vertical', lineHeight: 1.7 }}
                      placeholder="Write a riddle that others must solve to enter..."
                      id="forge-riddle"
                    />

                    {/* Live analysis */}
                    {newQuestion.trim() && (
                      <div style={{ marginTop: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Live Analysis</span>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, fontFamily: 'JetBrains Mono', fontWeight: 600,
                                       background: draftAnalysis.sentiment === 'dark' ? 'rgba(239,68,68,0.15)' : draftAnalysis.sentiment === 'light' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                                       color: draftAnalysis.sentiment === 'dark' ? '#fca5a5' : draftAnalysis.sentiment === 'light' ? '#93c5fd' : '#64748b',
                                       border: `1px solid ${draftAnalysis.sentiment === 'dark' ? 'rgba(239,68,68,0.3)' : draftAnalysis.sentiment === 'light' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                          VIBE: {draftAnalysis.sentiment.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, fontFamily: 'JetBrains Mono', fontWeight: 600,
                                       background: draftAnalysis.complexity_score !== null && draftAnalysis.complexity_score < 40 ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)',
                                       color: draftAnalysis.complexity_score !== null && draftAnalysis.complexity_score < 40 ? '#c4b5fd' : '#64748b',
                                       border: '1px solid rgba(255,255,255,0.08)' }}>
                          COMPLEXITY: {draftAnalysis.complexity_score !== null ? Math.round(draftAnalysis.complexity_score) : '...'}
                          {draftAnalysis.complexity_score !== null && draftAnalysis.complexity_score < 40 && ' 🌫'}
                        </span>
                        {draftAnalysis.is_paradox && (
                          <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, fontFamily: 'JetBrains Mono', fontWeight: 700,
                                         background: 'rgba(0,255,65,0.1)', color: '#00ff41', border: '1px solid rgba(0,255,65,0.3)',
                                         animation: 'pulse 1.5s infinite' }}>
                            ⊘ PARADOX DETECTED
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>The Answer</label>
                    <input
                      required type="text" value={newAnswer}
                      disabled={newAnswer === '••••••••'}
                      onChange={e => { setNewAnswer(e.target.value); setHiddenAnswer(e.target.value); }}
                      className="input-field"
                      style={{ maxWidth: 400, cursor: newAnswer === '••••••••' ? 'not-allowed' : 'text',
                               color: newAnswer === '••••••••' ? '#334155' : 'white',
                               fontFamily: newAnswer === '••••••••' ? 'JetBrains Mono' : 'Inter' }}
                      placeholder="The secret answer..."
                      id="forge-answer"
                    />
                    {newAnswer === '••••••••' && (
                      <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>Answer is hidden (auto-generated). Clear the riddle field to reset.</p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '14px 32px', fontSize: 15 }} id="forge-submit">
                    ⚒ Build New Door +25 pts
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar: Chat ── */}
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 96 }}>
          <div className="glass rounded-3xl overflow-hidden" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>Room Chat</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono' }}>#{roomData.id}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roomData.hints.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e293b', textAlign: 'center', gap: 8 }}>
                  <span style={{ fontSize: 32 }}>🌌</span>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>No messages yet.<br />It's eerily quiet...</p>
                </div>
              ) : (
                roomData.hints.map(hint => (
                  <div key={hint.id} style={{
                    padding: '12px 14px', borderRadius: 14,
                    background: 'rgba(99,91,255,0.06)',
                    border: '1px solid rgba(99,91,255,0.1)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #635bff, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: 'white'
                      }}>{hint.creator[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>{hint.creator}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono' }}>
                        {new Date(hint.created_at + "Z").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{hint.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddHint} style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text" required value={newHint}
                onChange={e => setNewHint(e.target.value)}
                placeholder="Leave a message..."
                className="input-field"
                style={{ padding: '10px 14px', fontSize: 13, borderColor: 'rgba(99,91,255,0.2)' }}
                id="chat-input"
              />
              <button type="submit" className="btn-secondary" style={{ fontSize: 13, padding: '10px' }} id="chat-send">
                Send →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Full Width Bottom Map ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 48px' }}>
        <div className="glass-strong rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(99,91,255,0.15)', height: 800, position: 'relative' }}>
          {/* Ambient Map Glow */}
          <Orb color="radial-gradient(rgba(99,91,255,0.2), transparent)" size="800px" x="50%" y="50%" opacity={0.15} />
          
          <div style={{ position: 'relative', zIndex: 10, padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #635bff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗺</div>
              <div>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 20, color: '#e2e8f0', fontFamily: 'Space Grotesk' }}>Global Maze Structure</span>
                <span style={{ display: 'block', fontSize: 13, color: '#94a3b8' }}>Live tracking of all active agents</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '14px 24px', background: 'rgba(0,0,0,0.4)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { color: '#ffffff', label: 'You are here' },
                { color: '#635bff', label: 'Unsolved' },
                { color: '#1e293b', label: 'Solved' },
                { color: '#f59e0b', label: 'Dead End' },
                { color: '#00ff41', label: 'Paradox' },
                { color: '#ef4444', label: 'Trap' },
                { color: '#3b82f6', label: 'Safe' },
                { color: '#a855f7', label: 'Fog' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, boxShadow: `0 0 10px ${l.color}` }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 'calc(100% - 93px)', background: 'rgba(0,0,0,0.2)' }}>
            {treeData.length > 0 ? (
              <Tree
                data={treeData}
                orientation="vertical"
                pathFunc="step"
                translate={{ x: Math.min(window.innerWidth, 1400) / 2 - 100, y: 80 }}
                nodeSize={{ x: 260, y: 160 }}
                renderCustomNodeElement={(props) => renderCustomNode(props, heatmap, currentRoomId, handleTravelTo, user)}
              />
            ) : (
              <div className="shimmer" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'JetBrains Mono', fontSize: 15 }}>
                <span className="pulse-ring" style={{ width: 20, height: 20, background: '#635bff', borderRadius: '50%', marginRight: 16 }}></span>
                Loading coordinate data...
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
