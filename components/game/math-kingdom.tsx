'use client';

import { useMemo, useState } from 'react';
import { submitAttemptAction } from '@/app/play/actions';

type LessonQuestion = {
  lessonId: string;
  skillId: string;
  prompt: string;
  answers: number[];
  correctAnswer: number;
};

type BattleMood = 'idle' | 'victory' | 'retry';

export function MathKingdom({ question }: { question: LessonQuestion }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [status, setStatus] = useState<string>('🎬 Scene set! Pick an answer to guide your hero forward.');
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<BattleMood>('idle');
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const progress = Math.min(100, (attempts / 5) * 100);

  const onAnswer = async (answer: number) => {
    setBusy(true);
    const durationMs = Date.now() - startedAt;

    const result = await submitAttemptAction({
      lessonId: question.lessonId,
      skillId: question.skillId,
      selectedAnswer: answer,
      correctAnswer: question.correctAnswer,
      durationMs
    });

    const isCorrect = result.isCorrect;
    setAttempts((prev) => prev + 1);

    if (isCorrect) {
      setMood('victory');
      setStreak((prev) => prev + 1);
      setStatus('✨ Critical hit! Parent approval pending for +5 tokens. Keep the combo alive!');
    } else {
      setMood('retry');
      setStreak(0);
      setStatus('🛡️ The gate is still locked. Try again and unleash your next move!');
    }

    setBusy(false);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3 rounded-xl bg-slate-950 p-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-bold tracking-wide">Math Kingdom: Crystal Gate</p>
          <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Combo x{streak}</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-white/80">
            <span>Quest Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-brand-mint transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p className="text-2xl font-bold">{question.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.answers.map((answer) => (
          <button
            key={answer}
            disabled={busy}
            onClick={() => onAnswer(answer)}
            className="rounded-xl border border-orange-200 bg-brand-peach px-4 py-3 text-lg font-semibold text-slate-900 transition hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {answer}
          </button>
        ))}
      </div>

      <p className="rounded-lg bg-slate-100 p-3 text-sm">{status}</p>

      <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-indigo-400 via-sky-300 to-emerald-300 p-4">
        <div className="cinematic-cloud absolute left-0 top-7 h-10 w-24 rounded-full bg-white/60 blur-[1px]" />
        <div className="cinematic-cloud-delayed absolute left-4 top-16 h-8 w-20 rounded-full bg-white/50 blur-[1px]" />

        <div className="absolute bottom-7 left-7">
          <div
            className={`h-14 w-14 rounded-full border-4 border-white/80 shadow-lg transition-all duration-300 ${
              mood === 'victory' ? 'scale-110 bg-yellow-200' : mood === 'retry' ? 'bg-rose-300' : 'bg-brand-navy'
            }`}
          />
          <p className="mt-2 text-xs font-semibold text-slate-900">Hero</p>
        </div>

        <div className="absolute bottom-8 right-8">
          <div
            className={`h-16 w-16 rounded-lg border-4 border-white/70 transition-all duration-300 ${
              mood === 'victory' ? 'bg-emerald-400' : mood === 'retry' ? 'bg-orange-400' : 'bg-violet-500'
            }`}
          />
          <p className="mt-2 text-xs font-semibold text-slate-900">Crystal Gate</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-emerald-700/60 to-transparent" />
      </div>
    </div>
  );
}
