import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('tf');
export const generateMetadata = makeTypeMetadata('tf');
export default makeTypePage('tf');
