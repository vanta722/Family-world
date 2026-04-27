'use client';

import { useEffect, useMemo, useState } from 'react';
import { submitAttemptAction } from '@/app/play/actions';

type LessonQuestion = {
  lessonId: string;
  skillId: string;
  prompt: string;
  answers: number[];
  correctAnswer: number;
};

type Mood = 'entering' | 'idle' | 'victory' | 'retry';

type Star = { left: number; top: number; size: number; delay: number; duration: number };

type Particle = { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number };

// ── Web Audio synth ──────────────────────────────────────────────────────────
function playSound(type: 'correct' | 'wrong' | 'combo') {
  try {
    const ctx = new ((window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    if (type === 'correct') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.35);
      });
    } else if (type === 'wrong') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(380, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.45);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.45);
    } else {
      [784, 988, 1175, 1568].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.18);
        o.start(ctx.currentTime + i * 0.06);
        o.stop(ctx.currentTime + i * 0.06 + 0.18);
      });
    }
  } catch { /* audio blocked */ }
}

// ── Particle burst ───────────────────────────────────────────────────────────
const VICTORY_COLORS = ['#FBBF24','#F97316','#EC4899','#06B6D4','#A78BFA','#34D399'];
const HIT_COLORS     = ['#EF4444','#F97316','#FCA5A5'];

function ParticleBurst({ particles }: { particles: Particle[] }) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            backgroundColor: p.color,
            left: p.x, top: p.y,
            animation: 'particle-burst 0.9s ease-out forwards',
            ['--dx' as string]: `${p.dx}px`,
            ['--dy' as string]: `${p.dy}px`,
          }}
        />
      ))}
    </>
  );
}

function makeParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * 20;
    const dist  = 40 + Math.random() * 70;
    return {
      id:    Math.random(),
      x:     120 + Math.random() * 20,
      y:     80  + Math.random() * 20,
      dx:    Math.cos((angle * Math.PI) / 180) * dist,
      dy:    Math.sin((angle * Math.PI) / 180) * dist,
      color: colors[i % colors.length],
      size:  5 + Math.floor(Math.random() * 7),
    };
  });
}

// ── Token earned pop ─────────────────────────────────────────────────────────
function TokenPop({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 animate-token-float z-20">
      <span className="rounded-full bg-brand-gold px-3 py-1 text-sm font-black text-slate-900 shadow-lg shadow-brand-gold/40">
        +5 ✨
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function MathKingdom({ question }: { question: LessonQuestion }) {
  const startedAt = useMemo(() => Date.now(), []);

  // Stable star field — generated once
  const stars = useMemo<Star[]>(() =>
    Array.from({ length: 28 }, () => ({
      left:     Math.random() * 100,
      top:      Math.random() * 75,
      size:     Math.random() * 2.5 + 0.5,
      delay:    Math.random() * 3,
      duration: 2 + Math.random() * 2.5,
    })), []);

  const [mood,         setMood]         = useState<Mood>('entering');
  const [streak,       setStreak]       = useState(0);
  const [attempts,     setAttempts]     = useState(0);
  const [busy,         setBusy]         = useState(false);
  const [shaking,      setShaking]      = useState(false);
  const [particles,    setParticles]    = useState<Particle[]>([]);
  const [flashColor,   setFlashColor]   = useState<string | null>(null);
  const [comboKey,     setComboKey]     = useState(0);   // re-mounts combo badge to retrigger animation
  const [tokenPop,     setTokenPop]     = useState(false);
  const [statusText,   setStatusText]   = useState('The Crystal Gate bars your path. Solve the Shadow Wizard\'s riddle to strike!');
  const [statusType,   setStatusType]   = useState<'idle' | 'victory' | 'retry'>('idle');
  const [heroAnim,     setHeroAnim]     = useState('');

  useEffect(() => {
    const t = setTimeout(() => setMood('idle'), 700);
    return () => clearTimeout(t);
  }, []);

  const progress = Math.min(100, (attempts / 5) * 100);

  const onAnswer = async (answer: number) => {
    if (busy) return;
    setBusy(true);
    const durationMs = Date.now() - startedAt;

    const result = await submitAttemptAction({
      lessonId:      question.lessonId,
      skillId:       question.skillId,
      selectedAnswer: answer,
      correctAnswer:  question.correctAnswer,
      durationMs,
    });

    setAttempts((p) => p + 1);

    if (result.isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMood('victory');
      setHeroAnim('animate-victory-bounce');
      setParticles(makeParticles(14, VICTORY_COLORS));
      setFlashColor('rgba(251,191,36,0.22)');
      setTokenPop(true);

      if (newStreak > 0 && newStreak % 3 === 0) {
        playSound('combo');
        setComboKey((k) => k + 1);
        setStatusText(`🔥 COMBO x${newStreak}! LEGENDARY STRIKE! The gate shatters! +5 tokens await the Royal Seal!`);
      } else {
        playSound('correct');
        setStatusText('⚔️ Critical hit! The Crystal Gate cracks! +5 tokens pending Royal Approval!');
      }
      setStatusType('victory');

      setTimeout(() => { setParticles([]); setFlashColor(null); setTokenPop(false); }, 1100);
      setTimeout(() => { setMood('idle'); setHeroAnim(''); }, 700);
    } else {
      setStreak(0);
      setMood('retry');
      setShaking(true);
      setParticles(makeParticles(7, HIT_COLORS));
      setFlashColor('rgba(239,68,68,0.18)');
      playSound('wrong');
      setStatusText('🛡️ The Shadow Wizard deflects your spell! The gate holds — rally and strike again!');
      setStatusType('retry');

      setTimeout(() => { setShaking(false); setParticles([]); setFlashColor(null); }, 600);
      setTimeout(() => setMood('idle'), 650);
    }

    setBusy(false);
  };

  // ── Arena border colour ──
  const arenaBorder =
    mood === 'victory' ? 'border-brand-gold/60 shadow-brand-gold/20'
    : mood === 'retry' ? 'border-red-500/60 shadow-red-500/20'
    : 'border-violet-700/40 shadow-violet-900/10';

  // ── Answer button colours ──
  const btnStyles = [
    'from-violet-600 to-violet-900 border-violet-400/60 hover:from-violet-500 hover:to-violet-800 shadow-violet-500/30',
    'from-cyan-600   to-cyan-900   border-cyan-400/60   hover:from-cyan-500   hover:to-cyan-800   shadow-cyan-500/30',
    'from-emerald-600 to-emerald-900 border-emerald-400/60 hover:from-emerald-500 hover:to-emerald-800 shadow-emerald-500/30',
    'from-orange-500 to-orange-800 border-orange-400/60 hover:from-orange-400 hover:to-orange-700 shadow-orange-500/30',
  ];

  return (
    <div className="space-y-3">
      {/* Global screen flash */}
      {flashColor && (
        <div
          className="pointer-events-none fixed inset-0 z-50 animate-screen-flash"
          style={{ backgroundColor: flashColor }}
        />
      )}

      {/* ── Arena ───────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 shadow-2xl transition-all duration-300 ${arenaBorder} ${shaking ? 'animate-shake' : ''}`}
        style={{ background: 'linear-gradient(180deg,#0f0a1e 0%,#1a0a2e 35%,#0d1f3c 70%,#040d1a 100%)' }}
      >
        {/* Scanline overlay */}
        <div className="scanlines pointer-events-none absolute inset-0 z-10" />

        {/* Star field */}
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width:  s.size, height: s.size,
                left:   `${s.left}%`, top: `${s.top}%`,
                animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative z-20 flex items-center justify-between border-b border-violet-800/40 px-5 py-3">
          <div>
            <p className="bg-gradient-to-r from-violet-300 via-brand-neon to-brand-gold bg-clip-text text-sm font-black uppercase tracking-[0.2em] text-transparent">
              Math Kingdom
            </p>
            <p className="text-xs text-violet-500/70">Crystal Gate — Chapter I</p>
          </div>

          {/* Combo badge */}
          <div
            key={comboKey}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-300 ${
              streak >= 3
                ? 'border-orange-400/70 bg-orange-900/40 text-orange-300 animate-combo-pop'
                : 'border-violet-700/50 bg-violet-900/30 text-violet-400'
            }`}
          >
            <span className="text-sm">{streak >= 3 ? '🔥' : '⚡'}</span>
            <span className="text-xs font-black">COMBO x{streak}</span>
          </div>
        </div>

        {/* Quest progress bar */}
        <div className="relative z-20 px-5 pt-3 pb-1">
          <div className="mb-1 flex justify-between text-xs text-violet-500/70">
            <span className="uppercase tracking-widest">Quest Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-violet-900/60 ring-1 ring-violet-700/30">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#7C3AED,#06B6D4,#10B981)',
                boxShadow: '0 0 8px rgba(6,182,212,0.6)',
              }}
            />
          </div>
        </div>

        {/* Battle scene */}
        <div className="relative z-20 h-52 px-5 pb-3 pt-1">
          <TokenPop visible={tokenPop} />
          <ParticleBurst particles={particles} />

          {/* Mist clouds */}
          <div className="cinematic-cloud absolute left-0 top-6 h-8 w-36 rounded-full opacity-[0.07]"
               style={{ background: 'radial-gradient(ellipse,#a78bfa,transparent)' }} />
          <div className="cinematic-cloud-delayed absolute left-10 top-14 h-6 w-28 rounded-full opacity-[0.06]"
               style={{ background: 'radial-gradient(ellipse,#67e8f9,transparent)' }} />

          {/* Ground line */}
          <div className="absolute bottom-0 inset-x-0 h-14"
               style={{ background: 'linear-gradient(180deg,transparent,rgba(4,13,26,0.95))' }} />

          {/* Crystal Gate */}
          <div
            className={`absolute right-6 bottom-12 transition-all duration-500 ${
              mood === 'victory' ? 'scale-110' : mood === 'retry' ? 'scale-95' : 'animate-gate-glow'
            }`}
          >
            {/* Victory pulse ring */}
            {mood === 'victory' && (
              <div className="absolute inset-0 -m-3 rounded-xl border-2 border-brand-gold/50 animate-pulse-ring" />
            )}
            {/* Gate body */}
            <div
              className={`relative h-24 w-16 rounded-t-2xl border-2 transition-all duration-300 ${
                mood === 'victory'
                  ? 'border-brand-gold bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-lg shadow-brand-gold/60'
                  : mood === 'retry'
                  ? 'border-red-400 bg-gradient-to-b from-red-500 to-red-800 shadow-md shadow-red-500/40'
                  : 'border-violet-400/80 bg-gradient-to-b from-violet-700 to-violet-950 shadow-lg shadow-violet-500/40'
              }`}
            >
              {/* Rune lines */}
              <div className="mt-3 flex flex-col items-center gap-1.5 opacity-50">
                <div className="h-1 w-7 rounded bg-white/60" />
                <div className="h-1 w-5 rounded bg-white/40" />
                <div className="h-1 w-7 rounded bg-white/60" />
                <div className="h-1 w-4 rounded bg-white/30" />
              </div>
              {/* Orb */}
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full border-2 transition-all duration-300 ${
                  mood === 'victory'
                    ? 'border-brand-gold bg-yellow-200 shadow-md shadow-brand-gold'
                    : mood === 'retry'
                    ? 'border-red-300 bg-red-300'
                    : 'border-brand-neon bg-cyan-300 shadow-md shadow-brand-neon/80'
                }`}
              />
            </div>
            {/* Pillars */}
            <div className="absolute -left-1.5 bottom-0 h-28 w-2.5 rounded-t bg-violet-800/70" />
            <div className="absolute -right-1.5 bottom-0 h-28 w-2.5 rounded-t bg-violet-800/70" />
            <p className="mt-2 text-center text-xs font-bold text-violet-400">Crystal Gate</p>
          </div>

          {/* Hero */}
          <div
            className={`absolute left-7 bottom-12 transition-all duration-500 ${
              mood === 'entering' ? '-translate-x-16 opacity-0' : 'animate-hero-enter'
            } ${heroAnim}`}
          >
            <div className="relative">
              {/* Body */}
              <div
                className={`relative h-16 w-14 rounded-t-2xl border-2 transition-all duration-300 ${
                  mood === 'victory'
                    ? 'border-brand-gold bg-gradient-to-b from-yellow-200 to-yellow-400 shadow-lg shadow-brand-gold/50'
                    : mood === 'retry'
                    ? 'border-rose-400 bg-gradient-to-b from-rose-400 to-rose-600'
                    : 'border-brand-neon/60 bg-gradient-to-b from-[#1e3a5f] to-[#0f2044] shadow-lg shadow-brand-neon/20'
                }`}
                style={mood === 'idle' ? { animation: 'float 3s ease-in-out infinite' } : undefined}
              >
                <div className="flex items-center justify-center h-full text-2xl">
                  {mood === 'victory' ? '😄' : mood === 'retry' ? '😤' : '🧙‍♂️'}
                </div>
              </div>
              {/* Cape */}
              <div
                className="absolute -right-1.5 top-5 h-9 w-2.5 rounded-r bg-brand-lilac/60 origin-top"
                style={{ animation: 'float 2.2s ease-in-out infinite' }}
              />
              {/* Sword on victory */}
              {mood === 'victory' && (
                <div
                  className="absolute -right-4 top-0 h-12 w-2 rounded-sm bg-brand-gold shadow-sm shadow-brand-gold"
                  style={{ transform: 'rotate(35deg)' }}
                />
              )}
            </div>
            <p className="mt-2 text-center text-xs font-bold text-brand-neon/80">Hero</p>
          </div>

          {/* Spell beam on victory */}
          {mood === 'victory' && (
            <div className="animate-lightning absolute bottom-24 left-24 right-28 pointer-events-none">
              <div className="h-0.5 w-full rounded"
                   style={{ background: 'linear-gradient(90deg,#06B6D4,#FBBF24,transparent)', boxShadow: '0 0 6px #FBBF24' }} />
              <div className="mt-1 h-0.5 w-3/4 rounded"
                   style={{ background: 'linear-gradient(90deg,transparent,#A78BFA,#FBBF24,transparent)' }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Riddle card ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-800/30 bg-gradient-to-br from-[#0d0820] to-[#0a1830] p-5 shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,#7C3AED 0%,transparent 55%), radial-gradient(circle at 80% 50%,#06B6D4 0%,transparent 55%)' }}
        />
        <p className="relative z-10 text-center text-3xl font-black tracking-wide text-white drop-shadow-lg">
          {question.prompt}
        </p>
        <p className="relative z-10 mt-1 text-center text-xs uppercase tracking-widest text-violet-500/60">
          Shadow Wizard's Riddle
        </p>
      </div>

      {/* ── Answer buttons ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {question.answers.map((answer, i) => (
          <button
            key={answer}
            disabled={busy}
            onClick={() => onAnswer(answer)}
            className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-br px-4 py-4 text-2xl font-black text-white shadow-lg transition-all duration-150 hover:scale-[1.05] hover:shadow-xl active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 ${btnStyles[i % btnStyles.length]}`}
          >
            <span className="relative z-10 drop-shadow">{answer}</span>
            <div className="absolute inset-0 bg-white/0 hover:bg-white/[0.06] transition-colors" />
          </button>
        ))}
      </div>

      {/* ── Status bar ───────────────────────────────────── */}
      <div
        key={statusText}
        className={`animate-slide-up rounded-xl border p-4 text-sm font-semibold transition-all duration-300 ${
          statusType === 'victory'
            ? 'border-brand-gold/30 bg-yellow-900/20 text-yellow-200'
            : statusType === 'retry'
            ? 'border-red-500/30 bg-red-900/20 text-red-300'
            : 'border-violet-700/30 bg-violet-900/20 text-violet-300'
        }`}
      >
        {statusText}
      </div>
    </div>
  );
}
