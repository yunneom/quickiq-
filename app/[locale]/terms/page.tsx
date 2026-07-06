import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { priceLabel } from '@/lib/pricing';
import { getBusinessInfo } from '@/lib/legal/business';

interface Section {
  h: string;
  body: string;
}

function buildCopy(locale: Locale): { title: string; sections: Section[] } {
  const price = priceLabel(locale);
  if (locale === 'ko') {
    return {
      title: '이용약관',
      sections: [
        {
          h: '제1조 (서비스 내용)',
          body: `본 서비스는 ${price}의 디지털 콘텐츠(IQ 상세 리포트 PDF)를 판매·제공합니다. 무료 테스트 응시 후, 원하는 이용자에 한해 상세 리포트를 구매할 수 있습니다.`,
        },
        {
          h: '제2조 (서비스 제공 시기)',
          body: '결제가 완료되면 즉시(최대 10분 이내) 이용자가 입력한 이메일 주소로 상세 리포트(PDF)가 자동 발송됩니다. 별도의 배송은 없습니다.',
        },
        {
          h: '제3조 (청약철회 및 환불)',
          body: '이용자는 결제 후 리포트(PDF)가 발송(제공 개시)되기 전까지 청약을 철회하고 전액 환불받을 수 있습니다. 다만 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라, 디지털 콘텐츠의 제공이 개시된 후에는 청약철회가 제한됩니다. 콘텐츠에 하자가 있거나 표시·광고 내용과 다르게 제공된 경우에는 제공 개시 후에도 환불이 가능합니다.',
        },
        {
          h: '제4조 (결과의 성격 및 면책)',
          body: '본 서비스가 제공하는 추정 IQ 점수 및 성향 분석 결과는 학술적·임상적 진단이 아니며 오락·자가 점검 참고용입니다. 운영자는 결과의 해석에 따른 이용자의 어떠한 결정에도 책임을 지지 않습니다.',
        },
      ],
    };
  }
  return {
    title: 'Terms of Service',
    sections: [
      {
        h: '1. Service',
        body: `This service sells a digital product (a detailed IQ PDF report) for ${price}. After taking the free test, users may optionally purchase the detailed report.`,
      },
      {
        h: '2. Delivery',
        body: 'Once payment completes, the detailed PDF report is emailed automatically to the address you provide, immediately (within 10 minutes). There is no physical shipment.',
      },
      {
        h: '3. Withdrawal & Refunds',
        body: 'You may withdraw your purchase and receive a full refund any time before the report has been delivered. Once delivery of the digital content has commenced, the right to withdraw is limited under applicable e-commerce consumer-protection law. Refunds remain available after delivery if the content is defective or differs from what was described.',
      },
      {
        h: '4. Nature of results & liability',
        body: 'The estimated IQ score and personality results are for entertainment and self-reflection only — not an academic or clinical diagnosis. The operator is not liable for any decisions made based on the results.',
      },
    ],
  };
}

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = locale as Locale;
  const t = buildCopy(loc);
  const biz = getBusinessInfo();
  const L =
    loc === 'ko'
      ? {
          sellerH: '사업자 정보',
          ceo: '대표자',
          regNo: '사업자등록번호',
          mailOrder: '통신판매업신고번호',
          addr: '사업장 주소',
          tel: '전화',
          email: '이메일',
        }
      : {
          sellerH: 'Seller information',
          ceo: 'Representative',
          regNo: 'Business Reg. No.',
          mailOrder: 'Mail-order No.',
          addr: 'Address',
          tel: 'Tel',
          email: 'Email',
        };

  return (
    <article className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>

      <div className="mt-6 space-y-5">
        {t.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-sm font-semibold text-gray-900">{s.h}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{s.body}</p>
          </section>
        ))}
      </div>

      {biz && (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-900">{L.sellerH}</h2>
          <dl className="mt-2 space-y-1 text-[13px] leading-relaxed text-gray-700">
            <div>{biz.name}</div>
            <div>
              {L.ceo}: {biz.ceo}
            </div>
            <div>
              {L.regNo}: {biz.regNo}
            </div>
            {biz.mailOrderNo && (
              <div>
                {L.mailOrder}: {biz.mailOrderNo}
              </div>
            )}
            <div>
              {L.addr}: {biz.address}
            </div>
            <div>
              {L.tel}: {biz.tel}
            </div>
            <div>
              {L.email}: {biz.email}
            </div>
          </dl>
        </section>
      )}
    </article>
  );
}
