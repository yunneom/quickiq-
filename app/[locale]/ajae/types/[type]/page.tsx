import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('ajae');
export const generateMetadata = makeTypeMetadata('ajae');
export default makeTypePage('ajae');
