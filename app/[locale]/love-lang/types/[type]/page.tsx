import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('love-lang');
export const generateMetadata = makeTypeMetadata('love-lang');
export default makeTypePage('love-lang');
