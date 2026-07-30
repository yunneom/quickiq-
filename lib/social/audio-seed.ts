/**
 * Operator-provided Suno tracks, seeded in code so the cron can import
 * them without any manual upload step: each scheduled run pulls a couple
 * of still-missing seeds (resolve share link → download MP3 → store),
 * and the soundtrack rotation picks them up as they land.
 *
 * These are the operator's own Suno generations (paid plan = commercial
 * license). Adding a track later = one more line here, or use
 * /admin/media in the browser.
 */
export interface AudioSeed {
  id: string;
  url: string;
  title?: string;
}

export const AUDIO_SEED: AudioSeed[] = [
  { id: 'suno-quiz-1', url: 'https://suno.com/s/sHfm9WzQdTiHVpqk' },
  { id: 'suno-quiz-2', url: 'https://suno.com/s/9vABicqzfdlDTlsW' },
  {
    id: 'suno-quiz-3',
    url: 'https://suno.com/song/9e2bce6a-e0f5-4805-9478-cb4079d5e5ea',
  },
  { id: 'suno-quiz-4', url: 'https://suno.com/s/Ytm2nBsreVeHPu7B' },
  {
    id: 'suno-quiz-5',
    url: 'https://suno.com/song/8c0b0487-619a-4e2e-8fdf-e14d9937ace8',
  },
  {
    id: 'suno-quiz-6',
    url: 'https://suno.com/song/e859300e-b645-4d0a-93f8-d5cda000fe21',
  },
  { id: 'suno-quiz-7', url: 'https://suno.com/s/qMDPovN4qqjRZSv7' },
  { id: 'suno-quiz-8', url: 'https://suno.com/s/VcQK1oy9auPwGM0h' },
];
