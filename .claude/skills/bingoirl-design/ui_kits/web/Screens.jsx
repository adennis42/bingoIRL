/* global React, CelButton, CelInput, BingoLogo, BingoBall, StatusChip, CelCard, Eyebrow, Hero, GameCard, PatternVisualizer, PATTERNS, BINGO_COL_COLORS */

const { useState, useEffect, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────────
// Shared state — mock of the real-time Firestore game document
// ─────────────────────────────────────────────────────────────────────────
function useMockGame() {
  const [game, setGame] = useState({
    code: 'AX72KQ',
    status: 'setup',
    currentRound: 1,
    totalRounds: 3,
    rounds: [
      { roundNumber: 1, pattern: 'traditional_line', prize: '$50 gift card' },
      { roundNumber: 2, pattern: 'four_corners', prize: 'Free drinks' },
      { roundNumber: 3, pattern: 'blackout', prize: 'Grand prize — $200' },
    ],
    called: [],    // {number:'B7', sequence:1}
    players: 12,
    venue: 'The Rusty Anchor',
  });

  const callNumber = (n) => setGame((g) => g.called.find((c) => c.number === n)
    ? g
    : { ...g, called: [{ number: n, sequence: g.called.length + 1 }, ...g.called] });
  const undoLast = () => setGame((g) => ({ ...g, called: g.called.slice(1) }));
  const start = () => setGame((g) => ({ ...g, status: 'active' }));

  return { game, setGame, callNumber, undoLast, start };
}

// ─────────────────────────────────────────────────────────────────────────
// Landing
// ─────────────────────────────────────────────────────────────────────────
function LandingScreen({ go }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#111' }}>
      <div style={{ marginBottom: 28 }}><BingoLogo size={56} /></div>

      {/* Comic divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 280, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 3, background: '#333' }} />
        <span style={{
          padding: '4px 12px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: '#111',
          background: 'linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)',
          border: '2px solid #111',
          boxShadow: '2px 2px 0 #111, inset 0 1px 0 rgba(255,255,255,0.35)',
        }}>★ LIVE ACTION ★</span>
        <div style={{ flex: 1, height: 3, background: '#333' }} />
      </div>

      <p style={{
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: '#888', marginBottom: 32, lineHeight: 1.6,
      }}>
        Call numbers · Track rounds<br />Manage winners in real time
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}>
        <CelButton variant="yellow" size="lg" fullWidth onClick={() => go('login')}>Host a Game</CelButton>
        <CelButton variant="blue" size="lg" fullWidth onClick={() => go('join')}>Join a Game</CelButton>
      </div>

      <div style={{
        marginTop: 32,
        padding: '8px 16px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10, fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: '#f5c542',
        border: '2px solid #f5c542',
        boxShadow: '2px 2px 0 #f5c542',
      }}>
        Free to Play · No Account Needed
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────
function LoginScreen({ go }) {
  const [email, setEmail] = useState('andrew@bingoirl.app');
  const [password, setPassword] = useState('••••••••');
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', background: '#111' }}>
      <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BingoLogo size={36} compact />
        </div>

        <CelCard elev="xl">
          <div style={{ borderBottom: '3px solid #111', paddingBottom: 14, marginBottom: 18 }}>
            <Hero size="sm">Host Login</Hero>
            <p style={{ color: '#666', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>
              Sign in to manage your games
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", color: '#f5c542', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Email</label>
              <CelInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", color: '#f5c542', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Password</label>
              <CelInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <CelButton variant="yellow" size="lg" fullWidth onClick={() => go('dashboard')}>Sign In →</CelButton>
          </div>
        </CelCard>

        <p style={{ textAlign: 'center', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          No account? <a href="#" style={{ color: '#f5c542', fontWeight: 900 }}>Sign up free</a>
        </p>
        <CelButton variant="ghost" onClick={() => go('landing')}>← Back</CelButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────
function DashboardScreen({ go, game }) {
  const pastGames = [
    { code: 'BR04LM', status: 'ended', currentRound: 3, totalRounds: 3 },
    { code: 'ZZ91OP', status: 'ended', currentRound: 2, totalRounds: 2 },
    { code: 'QR55KT', status: 'paused', currentRound: 1, totalRounds: 4 },
  ];

  return (
    <div style={{ minHeight: '100%', background: '#111' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Hero size="sm">Dashboard</Hero>
            <p style={{ color: '#555', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 2 }}>
              andrew@bingoirl.app
            </p>
          </div>
          <CelButton variant="yellow" size="sm" onClick={() => go('live')}>＋ New Game</CelButton>
        </div>

        {/* Quick grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { label: 'New Game', sub: 'Start hosting', go: 'live' },
            { label: 'Leaderboard', sub: 'Winners & seasons' },
            { label: 'Patterns', sub: 'Custom designs' },
            { label: 'Settings', sub: 'Sounds & prefs' },
          ].map((it) => (
            <div key={it.label}
              onClick={() => it.go && go(it.go)}
              style={{
                background: '#1a1a1a', border: '3px solid #111', boxShadow: '4px 4px 0 #111',
                padding: 14, cursor: it.go ? 'pointer' : 'default', transition: 'transform 120ms ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <p style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{it.label}</p>
              <p style={{ color: '#555', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{it.sub}</p>
            </div>
          ))}
        </div>

        {/* Active */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 3, background: '#50e878' }} />
            <span style={{ color: '#50e878', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.16em', padding: '0 4px' }}>Active Games</span>
            <div style={{ flex: 1, height: 3, background: '#50e878' }} />
          </div>
          <GameCard code={game.code} status={game.status === 'setup' ? 'setup' : 'active'} currentRound={game.currentRound} totalRounds={game.totalRounds} onClick={() => go('live')} />
        </section>

        {/* Past */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 3, background: '#333' }} />
            <span style={{ color: '#555', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.16em', padding: '0 4px' }}>Past Games</span>
            <div style={{ flex: 1, height: 3, background: '#333' }} />
          </div>
          {pastGames.map((g) => <GameCard key={g.code} {...g} dim onClick={() => {}} />)}
        </section>

        <CelButton variant="ghost" onClick={() => go('landing')}>← Back to landing</CelButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Live Game (Host)
// ─────────────────────────────────────────────────────────────────────────
const COLS = ['B','I','N','G','O'];
const COL_RANGES = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };

function formatNumber(n) {
  if (n <= 15) return `B${n}`;
  if (n <= 30) return `I${n}`;
  if (n <= 45) return `N${n}`;
  if (n <= 60) return `G${n}`;
  return `O${n}`;
}

function NumberCallerGrid({ called, onCall }) {
  const calledSet = useMemo(() => new Set(called.map((c) => c.number)), [called]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
        {COLS.map((col) => (
          <div key={col} style={{
            textAlign: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 900,
            fontSize: 14,
            padding: '6px 0',
            color: BINGO_COL_COLORS[col],
            background: `${BINGO_COL_COLORS[col]}18`,
            borderRadius: 6,
          }}>{col}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
        {Array.from({ length: 15 }, (_, rowIdx) =>
          COLS.map((col) => {
            const [start] = COL_RANGES[col];
            const actual = start + rowIdx;
            const number = formatNumber(actual);
            const isCalled = calledSet.has(number);
            const c = BINGO_COL_COLORS[col];
            return (
              <button key={number}
                onClick={() => !isCalled && onCall(number)}
                disabled={isCalled}
                style={{
                  aspectRatio: '1',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: 11,
                  background: isCalled ? `${c}25` : '#1c1c28',
                  color: isCalled ? c : '#8888aa',
                  border: `1px solid ${isCalled ? `${c}50` : '#2a2a3a'}`,
                  cursor: isCalled ? 'not-allowed' : 'pointer',
                  borderRadius: 6,
                  transition: 'transform 120ms ease',
                }}
                onMouseOver={(e) => { if (!isCalled) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = c; e.currentTarget.style.borderColor = c; } }}
                onMouseOut={(e) => { if (!isCalled) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#8888aa'; e.currentTarget.style.borderColor = '#2a2a3a'; } }}
              >
                {actual}
              </button>
            );
          })
        ).flat()}
      </div>
    </div>
  );
}

function LiveGameScreen({ go, gameState }) {
  const { game, callNumber, undoLast, start } = gameState;
  const currentNumber = game.called[0]?.number || null;
  const currentRound = game.rounds[game.currentRound - 1];

  if (game.status === 'setup') {
    // Lobby view
    return (
      <div style={{ minHeight: '100%', background: '#111', padding: '24px 16px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CelButton variant="ghost" size="sm" onClick={() => go('dashboard')}>← Dashboard</CelButton>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: '#f5c542', boxShadow: '0 0 6px #f5c542' }} />
              <span style={{ color: '#f5c542', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.14em' }}>Waiting</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Hero>Game Lobby</Hero>
            <p style={{ color: '#555', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>
              {game.totalRounds} rounds · Share the code to get players in
            </p>
          </div>

          {/* Player count */}
          <CelCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '8px 0' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 54, fontWeight: 900, color: '#50e878' }}>{game.players}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>players joined</p>
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Updates live</p>
              </div>
            </div>
          </CelCard>

          {/* Game Code */}
          <CelCard elev="lg">
            <Eyebrow>Game Code</Eyebrow>
            <div style={{
              textAlign: 'center',
              fontFamily: "'Arial Black', monospace",
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: '0.25em',
              color: '#fff',
              textShadow: '3px 3px 0 #111',
              padding: '16px 0',
            }}>{game.code}</div>
            <p style={{ textAlign: 'center', color: '#555', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Or scan the QR code at bingoirl.app/play
            </p>
          </CelCard>

          {/* Rounds */}
          <CelCard>
            <Eyebrow>Rounds</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {game.rounds.map((r) => (
                <div key={r.roundNumber} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700 }}>
                  <span style={{ color: '#ccc' }}>Round {r.roundNumber} · <span style={{ color: '#888' }}>{PATTERNS[r.pattern]?.name || r.pattern}</span></span>
                  {r.prize && <span style={{ color: '#f5c542', fontSize: 11, fontWeight: 900 }}>★ {r.prize}</span>}
                </div>
              ))}
            </div>
          </CelCard>

          <CelButton variant="green" size="xl" fullWidth onClick={start}>Start Game →</CelButton>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
            Players don't need an account to join
          </p>
        </div>
      </div>
    );
  }

  // Active game — simplified desktop layout
  return (
    <div style={{ minHeight: '100%', background: '#111', padding: '20px 16px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CelButton variant="ghost" size="sm" onClick={() => go('dashboard')}>← Dashboard</CelButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusChip status="active" />
            <CelButton variant="yellow" size="sm">Fullscreen</CelButton>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
          {/* Left — Round info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <CelCard>
              <Eyebrow>Game Code</Eyebrow>
              <div style={{ fontFamily: "'Arial Black', monospace", fontSize: 26, fontWeight: 900, letterSpacing: '0.2em', color: '#fff', marginTop: 6 }}>{game.code}</div>
              <p style={{ color: '#555', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{game.players} players · {game.venue}</p>
            </CelCard>

            {currentRound && (
              <CelCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Eyebrow>Round</Eyebrow>
                  <StatusChip status="setup" label={`${game.currentRound} / ${game.totalRounds}`} small />
                </div>
                <p style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, color: '#fff', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{PATTERNS[currentRound.pattern]?.name || currentRound.pattern}</p>
                {currentRound.prize && (
                  <p style={{ color: '#f5c542', fontSize: 12, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>★ {currentRound.prize}</p>
                )}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                  <PatternVisualizer cells={PATTERNS[currentRound.pattern]?.cells || []} size="md" />
                </div>
                <div style={{ marginTop: 12 }}>
                  <CelButton variant="orange" size="md" fullWidth>Mark Winner</CelButton>
                </div>
              </CelCard>
            )}
          </div>

          {/* Center — current ball */}
          <CelCard style={{ minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {currentNumber ? (
              <>
                <Eyebrow>Now Calling</Eyebrow>
                <BingoBall number={currentNumber} size={160} />
                <CelButton variant="ghost" size="sm" onClick={undoLast}>↩ Undo</CelButton>
              </>
            ) : (
              <>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  border: '2px dashed #2a2a3a', background: '#1c1c28',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 48, color: '#44445a', fontFamily: "'Arial Black', sans-serif", fontWeight: 900,
                }}>?</div>
                <p style={{ color: '#555', fontSize: 11, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.14em' }}>No numbers called yet</p>
              </>
            )}

            {/* Recent calls */}
            <div style={{ width: '100%', marginTop: 8 }}>
              <Eyebrow>Recent Calls</Eyebrow>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {game.called.slice(0, 8).map((c, i) => {
                  const col = c.number[0];
                  const color = BINGO_COL_COLORS[col];
                  return (
                    <div key={c.sequence} style={{
                      width: 44, height: 44,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900, fontSize: 12,
                      background: `${color}${i === 0 ? '30' : '15'}`,
                      color,
                      border: `1px solid ${color}${i === 0 ? '80' : '40'}`,
                      opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.1),
                      borderRadius: 8,
                    }}>{c.number}</div>
                  );
                })}
                {game.called.length === 0 && <p style={{ color: '#555', fontSize: 12 }}>—</p>}
              </div>
              {game.called.length > 0 && (
                <p style={{ color: '#555', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>{game.called.length} of 75 called</p>
              )}
            </div>
          </CelCard>

          {/* Right — Number grid */}
          <CelCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Eyebrow>Call Numbers</Eyebrow>
              <span style={{ color: '#f5c542', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700 }}>{game.called.length}/75</span>
            </div>
            <NumberCallerGrid called={game.called} onCall={callNumber} />
          </CelCard>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Join (Player)
// ─────────────────────────────────────────────────────────────────────────
function JoinScreen({ go, gameState }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e && e.preventDefault();
    if (code.toUpperCase() === gameState.game.code) {
      setErr('');
      go('player');
    } else if (code.length === 6) {
      setErr('Game not found. Check the code and try again.');
    }
  };

  const chars = code.split('').concat(Array(6 - code.length).fill(''));

  return (
    <div style={{ minHeight: '100%', background: '#111', padding: '48px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <CelButton variant="ghost" size="sm" onClick={() => go('landing')}>← Back</CelButton>

        <div style={{ textAlign: 'center' }}>
          <Hero>Join Game</Hero>
          <p style={{ color: '#555', fontSize: 11, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 10 }}>
            Enter your 6-character game code
          </p>
        </div>

        <CelCard elev="xl">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {chars.map((ch, i) => (
                <div key={i} style={{
                  width: 44, height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Arial Black', Impact, monospace",
                  fontWeight: 900, fontSize: 20,
                  background: ch
                    ? 'linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)'
                    : '#222',
                  color: ch ? '#111' : '#444',
                  border: '3px solid #111',
                  boxShadow: ch
                    ? '3px 3px 0 #111, inset 0 1px 0 rgba(255,255,255,0.4)'
                    : '2px 2px 0 #111',
                }}>{ch || '·'}</div>
              ))}
            </div>

            <CelInput
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="TYPE CODE HERE"
              style={{
                textAlign: 'center',
                letterSpacing: '0.4em',
                fontFamily: "'Arial Black', sans-serif",
                fontWeight: 900,
                fontSize: 16,
                background: '#222',
              }}
            />

            {err && (
              <div style={{
                padding: '10px 12px',
                border: '3px solid #e84040',
                background: 'rgba(232,64,64,0.13)',
                color: '#ff8080',
                fontSize: 12, fontWeight: 900,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: 'uppercase', letterSpacing: '0.06em',
                boxShadow: '3px 3px 0 #111',
              }}>⚠ {err}</div>
            )}

            <CelButton variant="blue" size="lg" fullWidth type="submit" disabled={code.length < 6}>
              Let's Play →
            </CelButton>
          </form>
        </CelCard>

        <p style={{ textAlign: 'center', color: '#555', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Hosting? <a href="#" onClick={(e) => { e.preventDefault(); go('login'); }} style={{ color: '#f5c542', fontWeight: 900 }}>Sign in here</a>
        </p>

        <div style={{ textAlign: 'center', fontSize: 10, color: '#444', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
          Try code <code style={{ color: '#f5c542' }}>{gameState.game.code}</code> to join the live game →
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Player live view
// ─────────────────────────────────────────────────────────────────────────
function PlayerScreen({ go, gameState }) {
  const { game } = gameState;
  const currentNumber = game.called[0]?.number || null;
  const previous = game.called.slice(1);
  const currentRound = game.rounds[game.currentRound - 1];

  return (
    <div style={{ minHeight: '100%', background: '#111', display: 'flex', flexDirection: 'column' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '2px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8,
            background: game.status === 'active' ? '#50e878' : '#f5c542',
            boxShadow: game.status === 'active' ? '0 0 6px #50e878' : 'none',
          }} />
          <span style={{ color: '#555', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {game.status === 'active' ? 'Live' : 'Waiting'}
          </span>
        </div>
        <StatusChip status="setup" label={`Code ${game.code}`} />
        <span style={{ color: '#555', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' }}>
          {game.called.length} called
        </span>
      </div>

      <div style={{ flex: 1, padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 460, margin: '0 auto', width: '100%' }}>
        {/* Current ball */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
          {currentNumber ? (
            <>
              <p style={{ color: '#555', fontSize: 10, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 14 }}>
                Now Calling
              </p>
              <BingoBall number={currentNumber} size={180} />
            </>
          ) : (
            <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 140, height: 140, borderRadius: '50%',
                border: '2px dashed #2a2a3a', background: '#1c1c28',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48, color: '#44445a', fontFamily: "'Arial Black', sans-serif", fontWeight: 900,
              }}>?</div>
              <p style={{ color: '#555', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Waiting for first call…</p>
            </div>
          )}
        </div>

        {/* Previously called */}
        {previous.length > 0 && (
          <div>
            <Eyebrow>Previously Called ({previous.length})</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {previous.map((c, i) => {
                const color = BINGO_COL_COLORS[c.number[0]];
                return (
                  <div key={c.sequence} style={{
                    width: 48, height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 900, fontSize: 13,
                    background: `${color}18`,
                    color,
                    border: `1px solid ${color}40`,
                    borderRadius: 10,
                    opacity: Math.max(0.45, 1 - i * 0.04),
                  }}>{c.number}</div>
                );
              })}
            </div>
          </div>
        )}

        {/* Round info */}
        {currentRound && (
          <CelCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow>Round</Eyebrow>
                <p style={{ fontFamily: "'Arial Black', sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textShadow: '2px 2px 0 #111' }}>
                  {game.currentRound}<span style={{ color: '#555', fontSize: 16, fontWeight: 400 }}> / {game.totalRounds}</span>
                </p>
              </div>
              {currentRound.prize && (
                <div style={{ textAlign: 'right' }}>
                  <Eyebrow>Prize</Eyebrow>
                  <p style={{ color: '#f5c542', fontSize: 14, fontWeight: 900, fontFamily: "'DM Sans', sans-serif" }}>★ {currentRound.prize}</p>
                </div>
              )}
            </div>

            <div style={{ height: 2, background: '#222', margin: '14px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div style={{ width: '100%' }}>
                <Eyebrow>Win Pattern</Eyebrow>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 900, fontFamily: "'DM Sans', sans-serif", marginTop: 4, textTransform: 'uppercase' }}>
                  {PATTERNS[currentRound.pattern]?.name || currentRound.pattern}
                </p>
              </div>
              <PatternVisualizer cells={PATTERNS[currentRound.pattern]?.cells || []} size="md" />
            </div>
          </CelCard>
        )}

        <CelButton variant="ghost" onClick={() => go('landing')}>← Leave game</CelButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Router shell
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState('landing');
  const gameState = useMockGame();

  const go = (s) => setScreen(s);

  const SCREENS = {
    landing: () => <LandingScreen go={go} />,
    login: () => <LoginScreen go={go} />,
    dashboard: () => <DashboardScreen go={go} game={gameState.game} />,
    live: () => <LiveGameScreen go={go} gameState={gameState} />,
    join: () => <JoinScreen go={go} gameState={gameState} />,
    player: () => <PlayerScreen go={go} gameState={gameState} />,
  };

  return <div>{SCREENS[screen]()}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
