/**
 * Seller identity for the e-commerce legal footer + terms page.
 *
 * Korea's 전자상거래법 제13조 (and the KakaoPay / card-issuer merchant
 * review) require the seller's 상호·대표자·사업자등록번호·주소·전화·이메일
 * to be shown on the site. We read them from env so the (public) business
 * details aren't hard-committed and can be set per environment:
 *
 *   NEXT_PUBLIC_BIZ_NAME         상호명
 *   NEXT_PUBLIC_BIZ_CEO          대표자명
 *   NEXT_PUBLIC_BIZ_REG_NO       사업자등록번호
 *   NEXT_PUBLIC_BIZ_ADDRESS      사업장 주소
 *   NEXT_PUBLIC_BIZ_TEL          전화번호
 *   NEXT_PUBLIC_BIZ_EMAIL        고객문의 이메일
 *   NEXT_PUBLIC_BIZ_MAILORDER_NO 통신판매업 신고번호 (면제 시 "면제" 등)
 *
 * The committed DEFAULTS below are the registered seller details — this
 * info is public by law (must be displayed on the site), so it's baked in
 * so the footer works on merge+deploy with no env setup. Any NEXT_PUBLIC_BIZ_*
 * env var overrides its corresponding default when set.
 */

export interface BusinessInfo {
  name: string;
  ceo: string;
  regNo: string;
  address: string;
  tel: string;
  email: string;
  /** Optional — 통신판매업 신고번호, or a literal like "면제" when exempt. */
  mailOrderNo?: string;
}

/** Registered seller details (전자상거래법 제13조). Public-disclosure info. */
const DEFAULTS = {
  name: '비라이크구일',
  ceo: '성스런',
  regNo: '772-17-02514',
  address: '경기도 수원시 장안구 만석로68번길 10, 598동 703호',
  tel: '010-3176-8152',
  email: 'nanobumi2@gmail.com',
  mailOrderNo: '면제',
} as const;

export function getBusinessInfo(): BusinessInfo | null {
  const name = process.env.NEXT_PUBLIC_BIZ_NAME?.trim() || DEFAULTS.name;
  const ceo = process.env.NEXT_PUBLIC_BIZ_CEO?.trim() || DEFAULTS.ceo;
  const regNo = process.env.NEXT_PUBLIC_BIZ_REG_NO?.trim() || DEFAULTS.regNo;
  const address = process.env.NEXT_PUBLIC_BIZ_ADDRESS?.trim() || DEFAULTS.address;
  const tel = process.env.NEXT_PUBLIC_BIZ_TEL?.trim() || DEFAULTS.tel;
  const email = process.env.NEXT_PUBLIC_BIZ_EMAIL?.trim() || DEFAULTS.email;

  // All six 전자상거래법-mandated fields must be present, otherwise we
  // render nothing rather than a half-filled (non-compliant) block.
  if (!name || !ceo || !regNo || !address || !tel || !email) return null;

  return {
    name,
    ceo,
    regNo,
    address,
    tel,
    email,
    mailOrderNo:
      process.env.NEXT_PUBLIC_BIZ_MAILORDER_NO?.trim() || DEFAULTS.mailOrderNo,
  };
}

export function isBusinessInfoConfigured(): boolean {
  return getBusinessInfo() !== null;
}
