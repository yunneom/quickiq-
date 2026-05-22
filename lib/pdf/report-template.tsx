/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ScoreResult } from '@/lib/scoring';

interface Props {
  sessionId: string;
  locale: 'ko' | 'en';
  result: ScoreResult;
  generatedAt: Date;
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
    fontFamily: 'Helvetica',
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

export function ReportPdf({ sessionId, locale, result, generatedAt }: Props) {
  const t = T[locale];
  const cs = result.categoryScores;

  return (
    <Document>
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
    </Document>
  );
}
