/**
 * Seeds the `questions` table from the bundled dummy data.
 *
 *   npm run seed
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { dummyKoQuestions } from '../lib/questions/dummy-ko';
import { dummyEnQuestions } from '../lib/questions/dummy-en';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const rows = [...dummyKoQuestions, ...dummyEnQuestions].map((q) => ({
    order_index: q.order_index,
    category: q.category,
    difficulty: q.difficulty,
    locale: q.locale,
    question_text: q.question_text,
    question_image_url: q.question_image_url ?? null,
    options: q.options,
    correct_id: q.correct_id,
    explanation: q.explanation,
  }));

  console.log(`Deleting existing rows...`);
  await sb.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log(`Inserting ${rows.length} rows...`);
  const { error } = await sb.from('questions').insert(rows);
  if (error) {
    console.error('Insert failed:', error);
    process.exit(1);
  }
  console.log('✅ Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
