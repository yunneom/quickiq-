'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trackFunnel } from '@/components/analytics/meta-pixel';
import { readUtm } from '@/components/analytics/utm-capture';
import type {
  PersonalityAnswer,
  PersonalityQuestion,
  PersonalityOptionId,
} from '@/lib/personality/types';
import type { Gender } from '@/lib/personality/teto-egen';

interface Props {
  locale: 'ko' | 'en';
  /** API base path (e.g. '/api/personality/teto-egen'). */
  apiBase: string;
  /** Where to send the user after submit (sessionId appended). */
  resultPathBase: string;
  /** Optional copy overrides — defaults are KO/EN inlined below. */
  copy?: Partial<RunnerCopy>;
  /** Whether the test needs a gender pre-question (테토/에겐 does). */
  requireGender?: boolean;
}

interface RunnerCopy {
  genderTitle: string;
  genderSub: string;
  male: string;
  female: string;
  loading: string;
  submitting: string;
  ofTotal: (idx: number, total: number) => string;
  errorStart: string;
  errorSubmit: string;
}

const DEFAULT_COPY: Record<'ko' | 'en', RunnerCopy> = {
  ko: {
    genderTitle: '먼저 알려주세요',
    genderSub: '결과 분류를 위해 성별이 필요해요. (저장되지 않습니다)',
    male: '남성',
    female: '여성',
    loading: '문항을 불러오는 중...',
    submitting: '결과를 계산하는 중...',
    ofTotal: (i, t) => `${i} / ${t}`,
    errorStart: '문항을 불러오지 못했어요. 새로고침 해주세요.',
    errorSubmit: '결과 전송에 실패했어요. 잠시 후 다시 시도해주세요.',
  },
  en: {
    genderTitle: 'First, a quick question',
    genderSub: "We need your gender to classify the result. (Not stored.)",
    male: 'Male',
    female: 'Female',
    loading: 'Loading questions...',
    submitting: 'Calculating your result...',
    ofTotal: (i, t) => `${i} / ${t}`,
    errorStart: "Couldn't load the questions. Please refresh.",
    errorSubmit: "Couldn't submit. Please try again in a moment.",
  },
};

type Phase = 'gender' | 'loading' | 'running' | 'submitting' | 'error';

export function PersonalityRunner({
  locale,
  apiBase,
  resultPathBase,
  copy,
  requireGender = false,
}: Props) {
  const router = useRouter();
  const c = { ...DEFAULT_COPY[locale], ...copy };
  const testType = apiBase.split('/').pop() ?? 'unknown';

  const [phase, setPhase] = useState<Phase>(requireGender ? 'gender' : 'loading');
  const [gender, setGender] = useState<Gender | null>(null);
  const [questions, setQuestions] = useState<PersonalityQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalityAnswer[]>([]);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Start the session once we have all prerequisites.
  useEffect(() => {
    if (phase !== 'loading') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/start`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ locale, utm: readUtm() ?? undefined }),
        });
        if (!res.ok) throw new Error('start_failed');
        const data = (await res.json()) as {
          sessionId: string;
          questions: PersonalityQuestion[];
        };
        if (cancelled) return;
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setPhase('running');
        trackFunnel('PT_TestStart', { testType, locale, sessionId: data.sessionId });
      } catch (err) {
        console.error('[personality-runner] start failed', err);
        if (cancelled) return;
        setErrMsg(c.errorStart);
        setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, apiBase, locale, c.errorStart, testType]);

  function handleGender(g: Gender) {
    setGender(g);
    setPhase('loading');
  }

  function handleAnswer(optionId: PersonalityOptionId) {
    const q = questions[index];
    if (!q) return;
    const updated = [...answers, { question_id: q.id, selected_id: optionId }];
    setAnswers(updated);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      void submitAnswers(updated);
    }
  }

  async function submitAnswers(finalAnswers: PersonalityAnswer[]) {
    if (!sessionId) return;
    setPhase('submitting');
    try {
      const res = await fetch(`${apiBase}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          locale,
          gender,
          answers: finalAnswers,
        }),
      });
      if (!res.ok) throw new Error('submit_failed');
      trackFunnel('PT_TestSubmitted', { testType, locale, sessionId });
      router.push(`${resultPathBase}/${sessionId}`);
    } catch (err) {
      console.error('[personality-runner] submit failed', err);
      setErrMsg(c.errorSubmit);
      setPhase('error');
    }
  }

  if (phase === 'gender') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <h1 className="text-2xl font-bold text-gray-900">{c.genderTitle}</h1>
        <p className="mt-2 text-sm text-gray-600">{c.genderSub}</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleGender('male')}
          >
            {c.male}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleGender('female')}
          >
            {c.female}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-sm text-gray-500">
        {phase === 'loading' ? c.loading : c.submitting}
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 text-center">
        <p className="text-sm text-red-600">{errMsg}</p>
      </div>
    );
  }

  const q = questions[index];
  if (!q) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-8">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
        <span>{c.ofTotal(index + 1, questions.length)}</span>
      </div>
      <Progress value={((index + 1) / questions.length) * 100} className="mt-2" />

      <div className="mt-10 flex-1">
        <h2 className="text-xl font-bold leading-snug text-gray-900">
          {q.question_text}
        </h2>

        <div className="mt-8 grid gap-3">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleAnswer(opt.id)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left text-base text-gray-800 transition hover:border-brand-400 hover:bg-brand-50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <span className="mr-3 inline-grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {opt.id}
              </span>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
