'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trackEvent } from '@/components/analytics/meta-pixel';
import type { Question, OptionId, Category } from '@/lib/questions/types';
import type { AnswerInput } from '@/lib/scoring';
import { Figure } from '@/components/figures/figure';
import { readUtm } from '@/components/analytics/utm-capture';

const PER_QUESTION_SECONDS = 60;
const AUTO_ADVANCE_DELAY_MS = 350;
const RESUME_TTL_MS = 30 * 60 * 1000; // 30 min — refresh within this window restores progress

interface ResumeBlob {
  sessionId: string;
  questions: Question[];
  index: number;
  answers: AnswerInput[];
  savedAt: number;
  locale: 'ko' | 'en';
}

function resumeKey(locale: 'ko' | 'en') {
  return `iq-test-resume-${locale}`;
}

function readResume(locale: 'ko' | 'en'): ResumeBlob | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(resumeKey(locale));
    if (!raw) return null;
    const b = JSON.parse(raw) as ResumeBlob;
    if (b.locale !== locale) return null;
    if (Date.now() - b.savedAt > RESUME_TTL_MS) {
      window.localStorage.removeItem(resumeKey(locale));
      return null;
    }
    return b;
  } catch {
    return null;
  }
}

function writeResume(blob: ResumeBlob) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(resumeKey(blob.locale), JSON.stringify(blob));
  } catch {
    // QuotaExceeded etc. — silent
  }
}

function clearResume(locale: 'ko' | 'en') {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(resumeKey(locale));
}

interface Props {
  locale: 'ko' | 'en';
}

interface StartResponse {
  sessionId: string;
  questions: Question[];
}

type Phase = 'loading' | 'running' | 'submitting';

const CATEGORY_PILL: Record<Category, string> = {
  verbal: 'bg-violet-50 text-violet-700',
  numerical: 'bg-sky-50 text-sky-700',
  spatial: 'bg-amber-50 text-amber-700',
  logical: 'bg-emerald-50 text-emerald-700',
};

export function TestRunner({ locale }: Props) {
  const t = useTranslations('test');
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionId | null>(null);
  const [answers, setAnswers] = useState<AnswerInput[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(PER_QUESTION_SECONDS);
  const [transitioning, setTransitioning] = useState(false);

  const questionStartedAtRef = useRef<number>(Date.now());
  const advancingRef = useRef(false);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Start ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try to resume an in-flight session from localStorage first —
        // accidental refresh / tab close shouldn't lose answers.
        const resumed = readResume(locale);
        if (resumed) {
          setSessionId(resumed.sessionId);
          setQuestions(resumed.questions);
          setIndex(resumed.index);
          setAnswers(resumed.answers);
          setPhase('running');
          questionStartedAtRef.current = Date.now();
          return;
        }

        const res = await fetch('/api/test/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ locale, utm: readUtm() }),
        });
        if (!res.ok) throw new Error('start_failed');
        const data: StartResponse = await res.json();
        if (cancelled) return;
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setPhase('running');
        trackEvent('StartTest');
        questionStartedAtRef.current = Date.now();
      } catch (e) {
        console.error(e);
        setTimeout(() => router.refresh(), 1000);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  // ─── Warn (but don't trap) on tab close / hard reload during the test ───
  // The previous version intercepted popstate with a confirm() prompt and
  // pushed a dummy history entry, which created an inescapable trap for any
  // headless/automated browser context. The lighter contract:
  //  - beforeunload prompts on tab close / refresh (real intent to lose work)
  //  - we no longer fight the back button — back-navigation just exits the
  //    test. PRD §2.2 "back disabled" is preserved by not rendering a back
  //    button or storing partial state in URL; users who manually pop back
  //    won't be able to resume the same session.
  useEffect(() => {
    if (phase !== 'running') return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [phase]);

  const current = questions[index];

  // ─── Keyboard shortcuts (A/B/C/D) for desktop users ───
  useEffect(() => {
    if (phase !== 'running' || !current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      // Ignore when typing into form fields.
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const key = e.key.toUpperCase();
      if (key === 'A' || key === 'B' || key === 'C' || key === 'D') {
        e.preventDefault();
        pickOption(key as OptionId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current?.id, transitioning]);

  // ─── Per-question countdown ───
  useEffect(() => {
    if (phase !== 'running' || !current) return;
    advancingRef.current = false;
    setSecondsLeft(PER_QUESTION_SECONDS);
    setSelected(null);
    setTransitioning(false);
    questionStartedAtRef.current = Date.now();

    tickIntervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
          handleAdvance(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, current?.id]);

  function pickOption(id: OptionId) {
    if (advancingRef.current || transitioning) return;
    setSelected(id);
    // Auto-advance after a short delay so user sees the highlight.
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setTransitioning(true);
    advanceTimeoutRef.current = setTimeout(() => {
      handleAdvance(id);
    }, AUTO_ADVANCE_DELAY_MS);
  }

  // Persist current progress every time index/answers change.
  useEffect(() => {
    if (phase !== 'running' || !sessionId || questions.length === 0) return;
    writeResume({
      sessionId,
      questions,
      index,
      answers,
      savedAt: Date.now(),
      locale,
    });
  }, [phase, sessionId, questions, index, answers, locale]);

  function handleAdvance(picked: OptionId | null) {
    if (advancingRef.current) return;
    advancingRef.current = true;
    if (!current) return;
    const timeMs = Date.now() - questionStartedAtRef.current;
    const answer: AnswerInput = {
      question_id: current.id,
      selected_id: picked,
      time_ms: timeMs,
    };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    if (index + 1 >= questions.length) {
      submit(nextAnswers);
    } else {
      setIndex(index + 1);
    }
  }

  async function submit(finalAnswers: AnswerInput[]) {
    if (!sessionId) return;
    setPhase('submitting');
    trackEvent('CompleteTest');
    // Resume blob no longer needed once we're submitting.
    clearResume(locale);
    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: finalAnswers }),
      });
      if (!res.ok) throw new Error('submit_failed');
      // The phase change to 'submitting' already tore down the beforeunload
      // listener via the useEffect cleanup; navigation can proceed cleanly.
      router.replace(`/${locale}/result/${sessionId}`);
    } catch (e) {
      console.error(e);
      setPhase('running');
      advancingRef.current = false;
    }
  }

  const progress = useMemo(
    () =>
      questions.length === 0
        ? 0
        : ((index + (selected ? 1 : 0)) / questions.length) * 100,
    [index, selected, questions.length],
  );

  if (phase === 'loading') {
    // Skeleton screen mirroring the test runner layout so the first paint
    // doesn't look "broken" while the start API call is in flight.
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200" />
        <div className="mt-6 h-6 w-20 rounded-full bg-gray-200" />
        <div className="mt-4 space-y-2">
          <div className="h-5 w-11/12 rounded bg-gray-200" />
          <div className="h-5 w-9/12 rounded bg-gray-200" />
        </div>
        <ul className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-14 rounded-xl border border-gray-200 bg-gray-100"
            />
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-gray-400">{t('loading')}</p>
      </div>
    );
  }
  if (phase === 'submitting') {
    return (
      <div className="grid min-h-[60vh] place-items-center text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p>{t('completing')}</p>
        </div>
      </div>
    );
  }
  if (!current) return null;

  const usesFigureOptions = Boolean(current.options[0]?.figure_id);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-6">
      {/* progress + timer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">
          {t('progress', { current: index + 1, total: questions.length })}
        </span>
        <span
          className={
            secondsLeft <= 10
              ? 'font-semibold text-red-600'
              : 'text-gray-500'
          }
        >
          {t('timeLeft')} {t('seconds', { n: secondsLeft })}
        </span>
      </div>
      <Progress value={progress} className="mt-2" />
      {/* Per-question dot grid — shows which questions are answered (filled),
          current (ring), and remaining (faint). 30 dots wrap on small screens. */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {questions.map((q, i) => {
          const answered = i < index;
          const isCurrent = i === index;
          return (
            <span
              key={q.id}
              className={
                'h-1.5 w-1.5 rounded-full ' +
                (isCurrent
                  ? 'h-2 w-2 bg-brand-600 ring-2 ring-brand-200'
                  : answered
                    ? 'bg-brand-600'
                    : 'bg-gray-200')
              }
              aria-hidden="true"
            />
          );
        })}
      </div>

      <div
        key={current.id}
        className={
          'flex flex-1 flex-col transition-opacity duration-200 ' +
          (transitioning ? 'opacity-60' : 'opacity-100 animate-[fadein_220ms_ease-out]')
        }
      >
        {/* category label */}
        <div
          className={
            'mt-6 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ' +
            CATEGORY_PILL[current.category]
          }
        >
          {t(`category.${current.category}`)}
        </div>

        {/* question */}
        <h2 className="mt-4 text-xl font-semibold leading-snug text-gray-900">
          {current.question_text}
        </h2>

        {current.figure_id && (
          <div className="mt-4 grid place-items-center rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-40 w-40">
              <Figure id={current.figure_id} />
            </div>
          </div>
        )}
        {current.question_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.question_image_url}
            alt=""
            className="mt-4 w-full rounded-xl border border-gray-200"
          />
        )}

        {/* options */}
        {usesFigureOptions ? (
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {current.options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    data-testid={`option-${opt.id}`}
                    disabled={transitioning}
                    onClick={() => pickOption(opt.id)}
                    className={
                      'flex w-full flex-col items-center gap-2 rounded-xl border bg-white p-3 transition ' +
                      (isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/30'
                        : 'border-gray-200 hover:bg-gray-50 active:scale-[0.98]')
                    }
                  >
                    <span
                      className={
                        'self-start grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ' +
                        (isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-600')
                      }
                    >
                      {opt.id}
                    </span>
                    <div className="h-20 w-20">
                      {opt.figure_id && <Figure id={opt.figure_id} />}
                    </div>
                    {opt.text && (
                      <span className="text-xs text-gray-700">{opt.text}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="mt-6 space-y-3">
            {current.options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    data-testid={`option-${opt.id}`}
                    disabled={transitioning}
                    onClick={() => pickOption(opt.id)}
                    className={
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left text-base transition ' +
                      (isSelected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99]')
                    }
                  >
                    <span
                      className={
                        'grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-sm font-semibold ' +
                        (isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-600')
                      }
                    >
                      {opt.id}
                    </span>
                    <span className="text-gray-900">{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">{t('noBack')}</p>
    </div>
  );
}
