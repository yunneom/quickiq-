import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('enneagram');
export const generateMetadata = makeTypeMetadata('enneagram');
export default makeTypePage('enneagram');
