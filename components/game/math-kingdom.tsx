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

export function MathKingdom({ question }: { question: LessonQuestion }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [status, setStatus] = useState<string>('Pick an answer to help your hero!');
  const [busy, setBusy] = useState(false);

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
    setStatus(result.isCorrect ? '✅ Great job! Pending parent approval for +5 tokens.' : '❌ Nice try! Keep practicing.');
    setBusy(false);
  };

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4">
      <div className="rounded-lg bg-sky-50 p-4">
        <p className="text-lg font-bold">Math Kingdom</p>
        <p className="text-xl">{question.prompt}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.answers.map((answer) => (
          <button
            key={answer}
            disabled={busy}
            onClick={() => onAnswer(answer)}
            className="rounded-lg bg-brand-peach px-4 py-3 text-lg font-semibold text-slate-900"
          >
            {answer}
          </button>
        ))}
      </div>
      <p className="rounded bg-slate-100 p-3 text-sm">{status}</p>
      <div className="h-40 rounded-xl bg-gradient-to-b from-sky-200 to-green-200 p-4">
        <div className="h-10 w-10 rounded-full bg-brand-navy" />
        <p className="mt-2 text-xs text-slate-700">Phaser scene placeholder (replace with Phaser canvas integration).</p>
      </div>
    </div>
  );
}
