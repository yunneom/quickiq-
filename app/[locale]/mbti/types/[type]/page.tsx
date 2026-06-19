import {
  makeTypePage,
  makeTypeMetadata,
  makeTypeStaticParams,
} from '@/lib/personality/type-page';

export const dynamicParams = false;
export const generateStaticParams = makeTypeStaticParams('mbti');
export const generateMetadata = makeTypeMetadata('mbti');
export default makeTypePage('mbti');
