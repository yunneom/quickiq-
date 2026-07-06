import { getBusinessInfo } from '@/lib/legal/business';

/**
 * 전자상거래법 제13조 seller-identity block, shown at the bottom of every
 * page (KakaoPay / card-issuer review requirement #1). Server component:
 * reads the env-backed business info and renders nothing until it's
 * configured, so the site stays clean pre-launch and the block appears
 * everywhere the moment the values are set in Vercel.
 */
export function BusinessFooter({ locale }: { locale: 'ko' | 'en' }) {
  const b = getBusinessInfo();
  if (!b) return null;

  const L =
    locale === 'ko'
      ? {
          ceo: '대표',
          regNo: '사업자등록번호',
          mailOrder: '통신판매업신고',
          tel: '전화',
          host: '호스팅: Vercel Inc.',
        }
      : {
          ceo: 'CEO',
          regNo: 'Business Reg. No.',
          mailOrder: 'Mail-order No.',
          tel: 'Tel',
          host: 'Hosting: Vercel Inc.',
        };

  return (
    <footer className="border-t border-gray-100 bg-white px-5 py-6">
      <div className="mx-auto max-w-md space-y-0.5 text-center text-[11px] leading-relaxed text-gray-400">
        <p>
          {b.name} · {L.ceo} {b.ceo}
        </p>
        <p>
          {L.regNo} {b.regNo}
          {b.mailOrderNo ? ` · ${L.mailOrder} ${b.mailOrderNo}` : ''}
        </p>
        <p>{b.address}</p>
        <p>
          {L.tel} {b.tel} · {b.email}
        </p>
      </div>
    </footer>
  );
}
