import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('attachment');
export const generateMetadata = makeTypeMetadata('attachment');
export default makeTypePage('attachment');
