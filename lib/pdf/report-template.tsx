/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Path,
  Circle,
  Line,
} from '@react-pdf/renderer';
import type { ScoreResult, AnswerInput } from '@/lib/scoring';
import type { Question, Category } from '@/lib/questions/types';

// Register Noto Sans Korean from the bundled font files. We previously
// fetched them from jsdelivr — moving to local files removes the ~1s
// cold-start network hop on the LS webhook path. SIL OFL licensed.
//
// IMPORTANT: @react-pdf needs an absolute file path on the server. We
// resolve it via process.cwd() which, in Vercel, points at the function
// root where `public/` is bundled.
import path from 'node:path';

const FONT_DIR = path.join(process.cwd(), 'public', 'fonts');
Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: path.join(FONT_DIR, 'noto-sans-kr-korean-400.woff'), fontWeight: 400 },
    { src: path.join(FONT_DIR, 'noto-sans-kr-korean-700.woff'), fontWeight: 700 },
  ],
});

interface Props {
  sessionId: string;
  locale: 'ko' | 'en';
  result: ScoreResult;
  generatedAt: Date;
  /** Optional — present when the buyer should see a per-question breakdown. */
  questions?: Question[];
  answers?: AnswerInput[];
}

interface CategoryInterpretation {
  /** strong: score ≥ 75 */
  strong: string;
  /** mid: 40 ≤ score < 75 */
  mid: string;
  /** weak: score < 40 */
  weak: string;
}

const T = {
  ko: {
    title: '상세 IQ 리포트',
    subtitle: '심리측정학 기반 30문항 추정 결과',
    estimatedIq: '추정 IQ',
    topPercentile: '상위 백분위',
    categoryTitle: '영역별 점수',
    timingTitle: '영역별 평균 응답 시간',
    verbal: '언어 추론',
    numerical: '수리 추론',
    spatial: '공간 추론',
    logical: '논리 추론',
    interpretationTitle: '영역별 해석',
    interpretation: {
      verbal: {
        strong:
          '언어 영역에서 두드러진 점수입니다. 어휘 관계 추론, 문장 분석, 비례 관계 파악 등 언어 기반 사고가 강점입니다. 글쓰기·기획·의사소통 직무에서 빛을 발하는 능력.',
        mid:
          '언어 영역은 안정적인 수준입니다. 익숙한 어휘는 빠르게 처리하지만, 추상적 비유나 다단계 어휘 관계에서 시간이 더 필요할 수 있습니다.',
        weak:
          '언어 영역은 개발 여지가 큰 부분입니다. 어휘 노출량을 늘리고 비교·대조 같은 관계 사고를 의식적으로 연습하면 단기간 개선이 가능합니다.',
      },
      numerical: {
        strong:
          '수리 영역에서 강한 점수입니다. 패턴 인식, 비율·비례, 다단계 산술이 빠릅니다. 데이터·재무·엔지니어링 분야에서 직관적으로 일하실 수 있는 유형.',
        mid:
          '수리 영역은 평균 수준입니다. 단순 산술은 안정적이지만 복합 패턴(피보나치형, ×2+1형)에서 한 박자 늦을 수 있습니다.',
        weak:
          '수리 영역은 더 연습이 필요한 부분입니다. 사고 자체보다는 익숙함의 문제인 경우가 많습니다 — 매일 짧은 수열·산술 퍼즐 10분이 효과적.',
      },
      spatial: {
        strong:
          '공간 영역이 인상적입니다. 도형 회전·전개·거울 변환을 머릿속에서 빠르게 처리합니다. 디자인, 건축, UI/UX, 외과의 같은 시각 정보 집약 직무에 어울리는 강점.',
        mid:
          '공간 영역은 안정적입니다. 직관적인 회전과 전개는 잘 처리하지만, 3D 단면 추론이나 4단계 이상의 시각 변환에서는 시간이 더 걸릴 수 있습니다.',
        weak:
          '공간 영역은 잠재력 큰 부분입니다. 종이 접기, 큐브 퍼즐, 도면 그리기 같은 시각 훈련은 사고력 자체보다 빠르게 향상되는 영역입니다.',
      },
      logical: {
        strong:
          '논리 영역에서 두드러진 점수입니다. 삼단논법, 대우 명제, 순서 추론, 다중 조건 처리가 모두 강합니다. 법조·전략 컨설팅·코딩 직무에서 핵심 자질.',
        mid:
          '논리 영역은 평균에 가깝습니다. 명제 자체는 잘 다루지만, 3개 이상의 조건이 얽히는 순서 추론에서 실수가 발생할 수 있습니다.',
        weak:
          '논리 영역은 개발 여지가 큰 부분입니다. 일상에서 "만약 ~라면" 같은 가정을 의식적으로 펼쳐 보는 연습이 가장 효과적입니다.',
      },
    } satisfies Record<string, CategoryInterpretation>,
    breakdownTitle: '문항별 분석',
    breakdownSubtitle: '응시하신 30문항의 정답과 해설입니다.',
    yourAnswer: '내 답',
    correctAnswer: '정답',
    correct: '정답',
    incorrect: '오답',
    skipped: '미응답',
    sessionLabel: '응시 ID',
    generatedAt: '발급일',
    disclaimer:
      '본 점수는 추정치이며 임상적 진단이 아닙니다. 결과는 응시 환경과 컨디션에 따라 달라질 수 있습니다.',
  },
  en: {
    title: 'Detailed IQ Report',
    subtitle: 'Psychometric estimation from 30 questions',
    estimatedIq: 'Estimated IQ',
    topPercentile: 'Top percentile',
    categoryTitle: 'Score by category',
    timingTitle: 'Average response time by domain',
    verbal: 'Verbal Reasoning',
    numerical: 'Numerical Reasoning',
    spatial: 'Spatial Reasoning',
    logical: 'Logical Reasoning',
    interpretationTitle: 'Interpretation',
    interpretation: {
      verbal: {
        strong:
          "Strong verbal reasoning. You handle word relations, sentence analysis, and analogies with ease — a hallmark trait for writing, planning, and communication roles.",
        mid:
          "Balanced verbal reasoning. Familiar vocabulary is fast, but abstract metaphors or multi-step word relations may need an extra beat.",
        weak:
          "Verbal reasoning has room to grow. Increasing vocabulary exposure and deliberately practicing analogies tends to lift this area quickly.",
      },
      numerical: {
        strong:
          "Strong numerical reasoning. Pattern recognition, ratios, and multi-step arithmetic come naturally — ideal for data, finance, and engineering work.",
        mid:
          "Numerical reasoning is around the average. Basic arithmetic is solid, but composite patterns (Fibonacci-like, ×2+1) can slow you down.",
        weak:
          "Numerical reasoning needs more reps. Often a familiarity issue, not a capability gap — 10 minutes of daily number puzzles compounds fast.",
      },
      spatial: {
        strong:
          "Impressive spatial reasoning. Rotations, unfoldings, and mirror transformations happen quickly in your head — great fit for design, architecture, UI/UX, surgery.",
        mid:
          "Stable spatial reasoning. Direct rotations and unfoldings work well, but 3D cross-sections and 4+ step visual transformations take longer.",
        weak:
          "Spatial reasoning is highly trainable. Paper-folding, cube puzzles, and sketching from imagination improve this area faster than most.",
      },
      logical: {
        strong:
          "Strong logical reasoning. Syllogisms, contrapositives, ordering, and multi-constraint puzzles all click — a core trait for law, strategy, and coding.",
        mid:
          "Logical reasoning around the average. Simple propositions are easy, but ordering puzzles with 3+ overlapping constraints can trip you up.",
        weak:
          "Logical reasoning has room to grow. Deliberately walking through 'if X then Y' chains in daily decisions is the most efficient practice.",
      },
    } satisfies Record<string, CategoryInterpretation>,
    breakdownTitle: 'Question-by-question breakdown',
    breakdownSubtitle: 'Your answers, the correct answers, and explanations for all 30 questions.',
    yourAnswer: 'You',
    correctAnswer: 'Correct',
    correct: 'Correct',
    incorrect: 'Wrong',
    skipped: 'Skipped',
    sessionLabel: 'Session ID',
    generatedAt: 'Issued',
    disclaimer:
      'This is an estimated score, not a clinical diagnosis. Results may vary depending on testing conditions.',
  },
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    color: '#111827',
    fontFamily: 'NotoSansKR',
    backgroundColor: '#ffffff',
  },
  pageSecondary: {
    padding: 36,
    fontSize: 10,
    color: '#111827',
    fontFamily: 'NotoSansKR',
    backgroundColor: '#ffffff',
  },
  header: { fontSize: 22, fontWeight: 700, color: '#1d40b8', marginBottom: 4 },
  sub: { fontSize: 11, color: '#6b7280', marginBottom: 24 },
  scoreCard: {
    backgroundColor: '#1d40b8',
    color: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  scoreLabel: { fontSize: 11, color: '#dde9ff' },
  scoreValue: { fontSize: 36, fontWeight: 700, color: '#ffffff', marginTop: 4 },
  scoreSub: { fontSize: 11, color: '#dde9ff', marginTop: 6 },

  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 10, marginTop: 8 },

  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 11,
  },
  catBarOuter: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  catBarInner: { height: 8, backgroundColor: '#3b6cff' },

  para: { fontSize: 10, color: '#374151', marginBottom: 8, lineHeight: 1.5 },

  // ── per-question breakdown ──
  bdGroupTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1d40b8',
    marginTop: 14,
    marginBottom: 6,
  },
  bdItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#dde9ff',
  },
  bdItemWrong: { borderLeftColor: '#fca5a5' },
  bdItemSkipped: { borderLeftColor: '#fcd34d' },

  bdHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  bdNum: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1d40b8',
    width: 28,
  },
  bdResult: {
    fontSize: 8,
    fontWeight: 700,
    color: '#16a34a',
    width: 36,
  },
  bdResultBad: { color: '#dc2626' },
  bdResultSkipped: { color: '#ca8a04' },
  bdQuestion: {
    fontSize: 9,
    color: '#111827',
    flex: 1,
  },
  bdAnswers: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 2,
  },
  bdExplanation: {
    fontSize: 8.5,
    color: '#4b5563',
    lineHeight: 1.4,
  },

  footerBox: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#9ca3af',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
});

const CATEGORY_ORDER: Category[] = ['verbal', 'numerical', 'spatial', 'logical'];

/** Build a single polygon's SVG path string from 4 scores. */
function radarPath(scores: { verbal: number; numerical: number; spatial: number; logical: number }, cx: number, cy: number, maxR: number): string {
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const order: (keyof typeof scores)[] = ['verbal', 'numerical', 'spatial', 'logical'];
  const pts = order.map((k, i) => {
    const r = (scores[k] / 100) * maxR;
    return [cx + r * Math.cos(angles[i]), cy + r * Math.sin(angles[i])];
  });
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ') + ' Z';
}

function pickInterpretation(i: CategoryInterpretation, score: number): string {
  if (score >= 75) return i.strong;
  if (score >= 40) return i.mid;
  return i.weak;
}

export function ReportPdf({
  sessionId,
  locale,
  result,
  generatedAt,
  questions,
  answers,
}: Props) {
  const t = T[locale];
  const cs = result.categoryScores;
  const showBreakdown = Boolean(questions && questions.length && answers);

  return (
    <Document>
      {/* ───── Page 1 — Summary ───── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{t.title}</Text>
        <Text style={styles.sub}>{t.subtitle}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>{t.estimatedIq}</Text>
          <Text style={styles.scoreValue}>{result.estimatedIq}</Text>
          <Text style={styles.scoreSub}>
            {t.topPercentile}: {result.topPercentile}%
          </Text>
        </View>

        {/* Mini radar — gives the PDF a hero visual instead of just bars. */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Svg width="180" height="180" viewBox="0 0 180 180">
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <Circle key={r} cx={90} cy={90} r={r * 70} fill="none" stroke="#e5e7eb" strokeWidth={0.6} />
            ))}
            {[-Math.PI / 2, 0, Math.PI / 2, Math.PI].map((a, i) => (
              <Line
                key={i}
                x1={90}
                y1={90}
                x2={90 + 70 * Math.cos(a)}
                y2={90 + 70 * Math.sin(a)}
                stroke="#e5e7eb"
                strokeWidth={0.6}
              />
            ))}
            <Path
              d={radarPath({ verbal: 56, numerical: 52, spatial: 48, logical: 54 }, 90, 90, 70)}
              fill="rgba(148, 163, 184, 0.2)"
              stroke="#94a3b8"
              strokeWidth={0.8}
            />
            <Path
              d={radarPath(cs, 90, 90, 70)}
              fill="rgba(37, 84, 230, 0.25)"
              stroke="#2554e6"
              strokeWidth={1.2}
            />
          </Svg>
        </View>

        <Text style={styles.sectionTitle}>{t.categoryTitle}</Text>
        {(
          [
            ['verbal', cs.verbal],
            ['numerical', cs.numerical],
            ['spatial', cs.spatial],
            ['logical', cs.logical],
          ] as const
        ).map(([key, val]) => (
          <View key={key}>
            <View style={styles.catRow}>
              <Text>{t[key]}</Text>
              <Text>{val}</Text>
            </View>
            <View style={styles.catBarOuter}>
              <View style={[styles.catBarInner, { width: `${val}%` }]} />
            </View>
          </View>
        ))}

        {result.categoryTiming && (
          <>
            <Text style={styles.sectionTitle}>{t.timingTitle}</Text>
            {(
              [
                ['verbal', result.categoryTiming.verbal],
                ['numerical', result.categoryTiming.numerical],
                ['spatial', result.categoryTiming.spatial],
                ['logical', result.categoryTiming.logical],
              ] as const
            ).map(([key, ms]) => {
              const sec = (ms / 1000).toFixed(1);
              const maxMs = Math.max(
                result.categoryTiming!.verbal,
                result.categoryTiming!.numerical,
                result.categoryTiming!.spatial,
                result.categoryTiming!.logical,
              );
              const pct = maxMs > 0 ? (ms / maxMs) * 100 : 0;
              return (
                <View key={key}>
                  <View style={styles.catRow}>
                    <Text>{t[key]}</Text>
                    <Text>{sec}s</Text>
                  </View>
                  <View style={styles.catBarOuter}>
                    <View
                      style={[
                        styles.catBarInner,
                        { width: `${pct}%`, backgroundColor: '#8b5cf6' },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}

        <Text style={styles.sectionTitle}>{t.interpretationTitle}</Text>
        <Text style={styles.para}>
          <Text style={{ fontWeight: 700 }}>{t.verbal} ({cs.verbal}) — </Text>
          {pickInterpretation(t.interpretation.verbal, cs.verbal)}
        </Text>
        <Text style={styles.para}>
          <Text style={{ fontWeight: 700 }}>{t.numerical} ({cs.numerical}) — </Text>
          {pickInterpretation(t.interpretation.numerical, cs.numerical)}
        </Text>
        <Text style={styles.para}>
          <Text style={{ fontWeight: 700 }}>{t.spatial} ({cs.spatial}) — </Text>
          {pickInterpretation(t.interpretation.spatial, cs.spatial)}
        </Text>
        <Text style={styles.para}>
          <Text style={{ fontWeight: 700 }}>{t.logical} ({cs.logical}) — </Text>
          {pickInterpretation(t.interpretation.logical, cs.logical)}
        </Text>

        <View style={styles.footerBox}>
          <View style={styles.footerRow}>
            <Text>{t.sessionLabel}</Text>
            <Text>{sessionId}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text>{t.generatedAt}</Text>
            <Text>{generatedAt.toISOString().slice(0, 10)}</Text>
          </View>
          <Text style={{ marginTop: 8 }}>{t.disclaimer}</Text>
        </View>
      </Page>

      {/* ───── Pages 2+ — Per-question breakdown (conditional) ───── */}
      {showBreakdown && (
        <Page size="A4" style={styles.pageSecondary} wrap>
          <Text style={styles.header}>{t.breakdownTitle}</Text>
          <Text style={styles.sub}>{t.breakdownSubtitle}</Text>

          {CATEGORY_ORDER.map((cat) => {
            const catQuestions = (questions ?? []).filter((q) => q.category === cat);
            if (!catQuestions.length) return null;
            return (
              <View key={cat} wrap>
                <Text style={styles.bdGroupTitle}>{t[cat]}</Text>
                {catQuestions.map((q) => {
                  const a = answers?.find((x) => x.question_id === q.id);
                  const userAns = a?.selected_id ?? null;
                  const isCorrect = userAns === q.correct_id;
                  const skipped = userAns == null;
                  return (
                    <View
                      key={q.id}
                      style={[
                        styles.bdItem,
                        skipped ? styles.bdItemSkipped : !isCorrect ? styles.bdItemWrong : {},
                      ]}
                      wrap={false}
                    >
                      <View style={styles.bdHeader}>
                        <Text style={styles.bdNum}>{q.order_index}.</Text>
                        <Text
                          style={[
                            styles.bdResult,
                            skipped
                              ? styles.bdResultSkipped
                              : !isCorrect
                                ? styles.bdResultBad
                                : {},
                          ]}
                        >
                          {skipped ? t.skipped : isCorrect ? t.correct : t.incorrect}
                        </Text>
                        <Text style={styles.bdQuestion}>{q.question_text}</Text>
                      </View>
                      <Text style={styles.bdAnswers}>
                        {t.yourAnswer}: {userAns ?? '—'}   ·   {t.correctAnswer}: {q.correct_id}
                      </Text>
                      {q.explanation && (
                        <Text style={styles.bdExplanation}>{q.explanation}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </Page>
      )}
    </Document>
  );
}
