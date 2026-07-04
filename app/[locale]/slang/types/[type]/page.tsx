import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('slang');
export const generateMetadata = makeTypeMetadata('slang');
export default makeTypePage('slang');
