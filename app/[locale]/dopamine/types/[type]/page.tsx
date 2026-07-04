import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('dopamine');
export const generateMetadata = makeTypeMetadata('dopamine');
export default makeTypePage('dopamine');
