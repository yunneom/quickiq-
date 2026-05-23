/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { ScoreResult, AnswerInput } from '@/lib/scoring';
import type { Question, Category } from '@/lib/questions/types';

// Register Noto Sans Korean from a CDN. @react-pdf/renderer fetches the
// file once per process and caches it in memory. Without this, Helvetica
// (the default) renders Korean characters as blanks/blocks in the PDF.
// Noto fonts are public-domain licensed (SIL OFL) so safe to embed.
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.18/files/noto-sans-kr-korean-400-normal.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.18/files/noto-sans-kr-korean-700-normal.ttf',
      fontWeight: 700,
    },
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

const T = {
  ko: {
    title: '상세 IQ 리포트',
    subtitle: '심리측정학 기반 30문항 추정 결과',
    estimatedIq: '추정 IQ',
    topPercentile: '상위 백분위',
    categoryTitle: '영역별 점수',
    verbal: '언어 추론',
    numerical: '수리 추론',
    spatial: '공간 추론',
    logical: '논리 추론',
    interpretationTitle: '영역별 해석',
    interpretation: {
      verbal:
        '언어 영역은 단어와 문장의 관계를 이해하고 의미를 추론하는 능력입니다. 점수가 높을수록 어휘력과 독해력이 우수한 경향이 있습니다.',
      numerical:
        '수리 영역은 숫자 패턴 인식, 산술 추론, 비례 사고에 관여합니다. 점수가 높을수록 정량적 문제 해결에 강점을 보입니다.',
      spatial:
        '공간 영역은 도형의 회전, 전개, 위치 관계를 시각화하는 능력입니다. 디자인·공학적 사고와 연관이 깊습니다.',
      logical:
        '논리 영역은 전제로부터 결론을 도출하는 연역적·귀납적 추론 능력입니다. 일상의 의사결정에서 자주 활용됩니다.',
    },
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
    verbal: 'Verbal Reasoning',
    numerical: 'Numerical Reasoning',
    spatial: 'Spatial Reasoning',
    logical: 'Logical Reasoning',
    interpretationTitle: 'Interpretation',
    interpretation: {
      verbal:
        'Verbal reasoning measures vocabulary and the ability to infer relationships between words and sentences. Higher scores correlate with strong reading comprehension.',
      numerical:
        'Numerical reasoning covers pattern recognition with numbers, arithmetic, and proportional thinking — often used in quantitative problem-solving.',
      spatial:
        'Spatial reasoning is the ability to visualize rotations, unfoldings, and positional relationships — linked to design and engineering aptitudes.',
      logical:
        'Logical reasoning evaluates deductive and inductive inference — drawing valid conclusions from premises in everyday decisions.',
    },
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

        <Text style={styles.sectionTitle}>{t.interpretationTitle}</Text>
        <Text style={styles.para}>{t.interpretation.verbal}</Text>
        <Text style={styles.para}>{t.interpretation.numerical}</Text>
        <Text style={styles.para}>{t.interpretation.spatial}</Text>
        <Text style={styles.para}>{t.interpretation.logical}</Text>

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
