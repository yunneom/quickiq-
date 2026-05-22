export type Category = 'verbal' | 'numerical' | 'spatial' | 'logical';
export type OptionId = 'A' | 'B' | 'C' | 'D';

export interface Option {
  id: OptionId;
  text?: string;
  /** Optional id of a small figure to render *inside* the option, e.g. for "pick the matching shape". */
  figure_id?: string;
}

export interface Question {
  id: string;
  order_index: number;
  category: Category;
  difficulty: 1 | 2 | 3 | 4 | 5;
  locale: 'ko' | 'en';
  question_text: string;
  question_image_url?: string | null;
  /** Optional id of a large figure shown above the question (spatial questions use this). */
  figure_id?: string;
  options: Option[];
  correct_id: OptionId;
  explanation: string;
}

export const CATEGORIES: Category[] = ['verbal', 'numerical', 'spatial', 'logical'];
