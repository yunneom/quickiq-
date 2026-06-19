import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('teto-egen');
export const generateMetadata = makeTypeMetadata('teto-egen');
export default makeTypePage('teto-egen');
