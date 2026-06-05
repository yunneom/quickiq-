import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { priceLabel } from '@/lib/pricing';

function buildCopy(locale: Locale) {
  const price = priceLabel(locale);
  if (locale === 'ko') {
    return {
      title: '이용약관',
      body: `본 서비스는 ${price}의 디지털 콘텐츠(IQ 상세 리포트 PDF)를 제공합니다.
디지털 콘텐츠 특성상, 결제 및 발송이 완료된 이후에는 환불이 불가합니다.
본 서비스에서 제공되는 추정 IQ 점수는 학술적·임상적 진단이 아니며 참고용으로만 사용하셔야 합니다.
서비스 운영자는 응시 결과의 해석으로 인한 어떠한 결정에도 책임을 지지 않습니다.`,
    };
  }
  return {
    title: 'Terms of Service',
    body: `This service provides a digital product (a detailed IQ PDF report) for ${price}.
Because the product is digital, refunds are not available once the report has been delivered.
The estimated IQ score provided here is for informational purposes only and is not a clinical diagnosis.
The operator is not liable for any decisions made based on the interpretation of the results.`,
  };
}

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = buildCopy(locale as Locale);
  return (
    <article className="prose mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {t.body}
      </p>
    </article>
  );
}
