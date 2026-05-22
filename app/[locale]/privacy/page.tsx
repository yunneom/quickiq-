import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';

const COPY = {
  ko: {
    title: '개인정보처리방침',
    body: `본 서비스는 결제 시 입력하신 이메일 주소를 수집합니다.
수집한 이메일은 결제 영수증 및 PDF 리포트 발송 목적에 한해 사용되며, 발송 완료 후 90일 내에 자동 파기됩니다.
응시 결과(점수, 카테고리별 점수)는 익명 세션 ID로 저장되며, 본인 외에는 조회할 수 없습니다.
관련 문의: support@example.com`,
  },
  en: {
    title: 'Privacy Policy',
    body: `We collect the email address you provide at checkout.
The email is used only to deliver your purchase receipt and PDF report, and is deleted within 90 days after delivery.
Test responses are stored against anonymous session IDs and are not linked to your identity.
Contact: support@example.com`,
  },
} as const;

export default function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = COPY[locale as Locale];
  return (
    <article className="prose mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {t.body}
      </p>
    </article>
  );
}
