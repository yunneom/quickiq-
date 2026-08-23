'use client';

import { useEffect, useState } from 'react';

/**
 * Browser UI for loading reel media — the operator prefers clicking to
 * shell commands, so this wraps /api/admin/audio and /api/admin/footage:
 * paste a Suno share link (or photo URL), press the button, done.
 *
 * Same auth pattern as /admin: ADMIN_TOKEN in localStorage, sent as
 * x-admin-token. Server rejects with 404 on a wrong token.
 */

const TOKEN_KEY = 'iq-admin-token';

interface AudioTrack {
  id: string;
  title?: string;
  storedAt: string;
}

interface FootageScene {
  scene: string;
  loaded: boolean;
  credit?: string;
  storedAt?: string;
}

interface ClipSceneStatus {
  scene: string;
  clips: { id: string; credit?: string; license?: string }[];
}

const SCENES: Array<{ id: string; label: string }> = [
  { id: 'rails', label: '기찻길 (기차·다리 문제)' },
  { id: 'road', label: '야간 도로 (차량 속도 문제)' },
  { id: 'chalk', label: '칠판 (수학·작업률·수열)' },
  { id: 'slate', label: '슬레이트 (스펠링)' },
];

export default function MediaAdminPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [scenes, setScenes] = useState<FootageScene[]>([]);
  const [clipScenes, setClipScenes] = useState<ClipSceneStatus[]>([]);
  const [clipTarget, setClipTarget] = useState(3);

  const [songUrl, setSongUrl] = useState('');
  const [songId, setSongId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoScene, setPhotoScene] = useState('rails');
  const [photoCredit, setPhotoCredit] = useState('');
  const [clipUrl, setClipUrl] = useState('');
  const [clipScene, setClipScene] = useState('rails');
  const [clipCredit, setClipCredit] = useState('');
  const [importNotes, setImportNotes] = useState<string[]>([]);
  const [pexelsKey, setPexelsKey] = useState('');
  const [pexelsConfigured, setPexelsConfigured] = useState(false);

  const [crosspost, setCrosspost] = useState<{
    tiktok: { appConfigured: boolean; connected: boolean; openId?: string };
    youtube: { appConfigured: boolean; connected: boolean; channelTitle?: string };
    threads: { appConfigured: boolean; connected: boolean; username?: string };
  }>({
    tiktok: { appConfigured: false, connected: false },
    youtube: { appConfigured: false, connected: false },
    threads: { appConfigured: false, connected: false },
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      void refresh(saved);
    }

    // The OAuth callbacks redirect back here with ?tiktok=... / ?youtube=...
    // — surface the result once, then scrub the URL so a page refresh
    // doesn't re-show a stale message.
    const params = new URLSearchParams(window.location.search);
    const platformLabel: Record<string, string> = {
      tiktok: '틱톡',
      youtube: '유튜브',
      threads: '쓰레드',
    };
    for (const platform of ['tiktok', 'youtube', 'threads']) {
      const result = params.get(platform);
      if (result === 'connected') {
        setNotice(`${platformLabel[platform]} 연결 완료 — 다음 발행부터 자동으로 함께 올라갑니다.`);
      } else if (result === 'error') {
        setErr(`${platformLabel[platform]} 연결 실패: ${params.get('reason') ?? 'unknown'}`);
      }
    }
    if (params.has('tiktok') || params.has('youtube') || params.has('threads')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Mount-only by design: `refresh` is redefined every render (not
    // memoized), so listing it here would either re-run on every render
    // or need a useCallback purely to satisfy the linter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh(t: string) {
    setBusy(true);
    setErr(null);
    try {
      const [audioRes, footageRes, clipsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/audio', {
          headers: { 'x-admin-token': t },
          cache: 'no-store',
        }),
        fetch('/api/admin/footage', {
          headers: { 'x-admin-token': t },
          cache: 'no-store',
        }),
        fetch('/api/admin/clips', {
          headers: { 'x-admin-token': t },
          cache: 'no-store',
        }),
        fetch('/api/admin/settings', {
          headers: { 'x-admin-token': t },
          cache: 'no-store',
        }),
      ]);
      if (!audioRes.ok || !footageRes.ok || !clipsRes.ok) {
        setErr('토큰이 틀렸거나 서버 오류입니다.');
        setAuthed(false);
        return;
      }
      const audio = (await audioRes.json()) as { tracks: AudioTrack[] };
      const footage = (await footageRes.json()) as { scenes: FootageScene[] };
      const clips = (await clipsRes.json()) as {
        target: number;
        scenes: ClipSceneStatus[];
      };
      setTracks(audio.tracks ?? []);
      setScenes(footage.scenes ?? []);
      setClipScenes(clips.scenes ?? []);
      setClipTarget(clips.target ?? 3);
      if (settingsRes.ok) {
        const settings = (await settingsRes.json()) as {
          pexelsConfigured?: boolean;
          crosspost?: typeof crosspost;
        };
        setPexelsConfigured(Boolean(settings.pexelsConfigured));
        if (settings.crosspost) setCrosspost(settings.crosspost);
      }
      setAuthed(true);
      window.localStorage.setItem(TOKEN_KEY, t);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function addSong() {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/audio', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: songUrl.trim(),
          ...(songId.trim() ? { id: songId.trim() } : {}),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(`${data.error ?? `HTTP ${res.status}`}${data.hint ? ` — ${data.hint}` : ''}`);
        return;
      }
      setNotice(`곡 등록 완료: ${data.id}. 다음 발행부터 릴스에 이 음악이 들어갑니다.`);
      setSongUrl('');
      setSongId('');
      await refresh(token);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function addPhoto() {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/footage', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene: photoScene,
          url: photoUrl.trim(),
          ...(photoCredit.trim() ? { credit: photoCredit.trim() } : {}),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(`${data.error ?? `HTTP ${res.status}`}${data.hint ? ` — ${data.hint}` : ''}`);
        return;
      }
      setNotice(`사진 등록 완료: ${photoScene} 씬. 다음 발행부터 실사 배경이 적용됩니다.`);
      setPhotoUrl('');
      setPhotoCredit('');
      await refresh(token);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(
    endpoint: '/api/admin/audio' | '/api/admin/clips',
    file: File,
    extra: Record<string, string>,
    successMsg: string,
  ) {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.set('file', file);
      for (const [k, v] of Object.entries(extra)) if (v) fd.set(k, v);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(`${data.error ?? `HTTP ${res.status}`}${data.hint ? ` — ${data.hint}` : ''}`);
        return;
      }
      setNotice(`${successMsg}: ${data.id}`);
      await refresh(token);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function savePexelsKey() {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pexelsApiKey: pexelsKey.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        pexelsConfigured?: boolean;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(`${data.error ?? `HTTP ${res.status}`}${data.hint ? ` — ${data.hint}` : ''}`);
        return;
      }
      setPexelsConfigured(Boolean(data.pexelsConfigured));
      setPexelsKey('');
      setNotice(
        'Pexels 키 저장 완료. 이제 "영상 자동 수집 실행"을 누르면 고화질 스톡에서 바로 수집합니다.',
      );
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  function connectUrl(platform: 'tiktok' | 'youtube' | 'threads'): string {
    return `/api/auth/${platform}?token=${encodeURIComponent(token)}`;
  }

  async function disconnectPlatform(platform: 'tiktok' | 'youtube' | 'threads') {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disconnect: platform }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErr(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const platformLabel: Record<string, string> = {
        tiktok: '틱톡',
        youtube: '유튜브',
        threads: '쓰레드',
      };
      setNotice(`${platformLabel[platform]} 연결 해제 완료.`);
      await refresh(token);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runClipImport() {
    setBusy(true);
    setErr(null);
    setNotice(null);
    setImportNotes([]);
    try {
      const res = await fetch('/api/admin/clips', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'import' }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        imported?: string[];
        scenesShort?: string[];
        notes?: string[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const n = data.imported?.length ?? 0;
      setNotice(
        n > 0
          ? `영상 ${n}개 수집 완료 (${data.imported!.join(', ')}). 부족한 씬: ${
              data.scenesShort?.length ? data.scenesShort.join(', ') : '없음'
            }`
          : `새로 수집된 영상 없음. 부족한 씬: ${
              data.scenesShort?.length ? data.scenesShort.join(', ') : '없음 — 풀이 가득 찼습니다'
            }`,
      );
      // The whole point of collecting: WHY each candidate failed. Without
      // this, "수집 안 됨" is all the operator can ever report back.
      setImportNotes(data.notes ?? []);
      await refresh(token);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function addClip() {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/clips', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene: clipScene,
          url: clipUrl.trim(),
          ...(clipCredit.trim() ? { credit: clipCredit.trim() } : {}),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(`${data.error ?? `HTTP ${res.status}`}${data.hint ? ` — ${data.hint}` : ''}`);
        return;
      }
      setNotice(`영상 등록 완료: ${data.id}. 다음 발행부터 이 씬은 실사 영상 배경입니다.`);
      setClipUrl('');
      setClipCredit('');
      await refresh(token);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 pb-10">
        <h1 className="text-2xl font-extrabold text-gray-900">릴스 미디어 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vercel 환경변수의 <code className="rounded bg-gray-100 px-1 text-xs">ADMIN_TOKEN</code> 값을
          입력하세요. /admin과 같은 토큰입니다.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="admin token"
          className="mt-6 rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <button
          type="button"
          onClick={() => void refresh(token)}
          disabled={busy || !token}
          className="mt-3 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {busy ? '확인 중…' : '열기'}
        </button>
        {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-10">
      <h1 className="text-2xl font-extrabold text-gray-900">릴스 미디어 관리</h1>
      <p className="mt-1 text-sm text-gray-500">
        음악과 실사 배경을 여기서 올립니다. 등록 즉시 다음 자동 발행부터 적용됩니다.
      </p>

      {notice && (
        <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          ✅ {notice}
        </p>
      )}
      {err && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {err}
        </p>
      )}

      {/* ------------------------------------------------ 크로스포스팅 */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">📤 틱톡 · 유튜브 쇼츠 · 쓰레드 동시 업로드</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          한 번 연결해두면, 인스타에 올라가는 릴스가 같은 영상 그대로 틱톡·유튜브 쇼츠·쓰레드에도
          자동으로 올라갑니다. 연결은 각 플랫폼 로그인 화면으로 이동해 한 번만 승인하면 끝입니다.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">틱톡</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {!crosspost.tiktok.appConfigured
                  ? '앱 설정 필요 (Vercel에 TIKTOK_CLIENT_KEY/SECRET)'
                  : crosspost.tiktok.connected
                    ? `연결됨${crosspost.tiktok.openId ? ` (${crosspost.tiktok.openId.slice(0, 10)}…)` : ''} — 심사 전이면 비공개로만 올라갑니다`
                    : '연결 안 됨'}
              </p>
            </div>
            {crosspost.tiktok.connected ? (
              <button
                type="button"
                onClick={() => void disconnectPlatform('tiktok')}
                disabled={busy}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 disabled:opacity-50"
              >
                연결 해제
              </button>
            ) : (
              <a
                href={crosspost.tiktok.appConfigured ? connectUrl('tiktok') : undefined}
                aria-disabled={!crosspost.tiktok.appConfigured}
                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                  crosspost.tiktok.appConfigured ? 'bg-brand-600' : 'pointer-events-none bg-gray-300'
                }`}
              >
                틱톡 연결
              </a>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">유튜브 쇼츠</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {!crosspost.youtube.appConfigured
                  ? '앱 설정 필요 (Vercel에 YOUTUBE_CLIENT_ID/SECRET)'
                  : crosspost.youtube.connected
                    ? `연결됨${crosspost.youtube.channelTitle ? ` (${crosspost.youtube.channelTitle})` : ''}`
                    : '연결 안 됨'}
              </p>
            </div>
            {crosspost.youtube.connected ? (
              <button
                type="button"
                onClick={() => void disconnectPlatform('youtube')}
                disabled={busy}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 disabled:opacity-50"
              >
                연결 해제
              </button>
            ) : (
              <a
                href={crosspost.youtube.appConfigured ? connectUrl('youtube') : undefined}
                aria-disabled={!crosspost.youtube.appConfigured}
                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                  crosspost.youtube.appConfigured ? 'bg-brand-600' : 'pointer-events-none bg-gray-300'
                }`}
              >
                유튜브 연결
              </a>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">쓰레드</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {!crosspost.threads.appConfigured
                  ? '앱 설정 필요 (Vercel에 THREADS_APP_ID/SECRET)'
                  : crosspost.threads.connected
                    ? `연결됨${crosspost.threads.username ? ` (@${crosspost.threads.username})` : ''}`
                    : '연결 안 됨'}
              </p>
            </div>
            {crosspost.threads.connected ? (
              <button
                type="button"
                onClick={() => void disconnectPlatform('threads')}
                disabled={busy}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 disabled:opacity-50"
              >
                연결 해제
              </button>
            ) : (
              <a
                href={crosspost.threads.appConfigured ? connectUrl('threads') : undefined}
                aria-disabled={!crosspost.threads.appConfigured}
                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                  crosspost.threads.appConfigured ? 'bg-brand-600' : 'pointer-events-none bg-gray-300'
                }`}
              >
                쓰레드 연결
              </a>
            )}
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
          &ldquo;앱 설정 필요&rdquo;라고 뜨면 개발자 포털에서 앱을 먼저 만들어야 합니다 — 방법은 담당자에게
          안내받은 설정 가이드를 참고하세요. 틱톡은 신규 앱이 심사받기 전까지 게시물이 본인만
          보이는 비공개로 올라갑니다(틱톡 정책, 코드로 바꿀 수 없음). 심사가 끝나면 그 이후에
          새로 올라가는 게시물부터 공개로 전환되고, 심사 전에 이미 올라간 건 그대로 비공개로
          남습니다. 쓰레드·유튜브는 본인 계정에 올리는 한 별도 심사 없이 바로 공개로 올라갑니다.
        </p>
      </section>

      {/* ------------------------------------------------ 음악 */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">🎵 음악 (수노)</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          수노 곡의 <b>공유 링크</b>(suno.com/s/…)를 그대로 붙여넣으세요. 서버가 MP3를 알아서
          찾습니다. 유명곡·타인 음원은 절대 금지 — 저작권 매칭으로 계정이 제재됩니다.
        </p>
        <input
          value={songUrl}
          onChange={(e) => setSongUrl(e.target.value)}
          placeholder="https://suno.com/s/…"
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
          placeholder="곡 이름 (선택, 예: suno-quiz-1 — 비우면 자동)"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void addSong()}
          disabled={busy || !songUrl.trim()}
          className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? '등록 중…' : '이 곡 릴스에 사용하기'}
        </button>

        <label className="mt-3 block">
          <span className="text-xs text-gray-500">
            링크 등록이 실패하면: 수노 앱에서 MP3를 기기에 저장한 뒤 파일을 직접 올리세요.
          </span>
          <input
            type="file"
            accept="audio/*"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile('/api/admin/audio', f, {}, '곡 업로드 완료');
              e.target.value = '';
            }}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
        </label>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            등록된 곡 {tracks.length}개
            {tracks.length > 1 ? ' · 포스트마다 자동 로테이션' : ''}
          </h3>
          {tracks.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              아직 없음 — 지금은 무음으로 발행되고 있습니다.
            </p>
          ) : (
            <ul className="mt-2 space-y-1">
              {tracks.map((t) => (
                <li key={t.id} className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-gray-800">{t.title ?? t.id}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(t.storedAt).toLocaleDateString('ko-KR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ 스톡 API 키 */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">🔑 Pexels API 키</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          키를 저장하면 자동 수집기가 Pexels의 고화질 실사 영상(기차·야간 도로 등)을
          제한 없이 가져옵니다. 출처 표기도 필요 없습니다. 키는 비공개 저장소에만
          보관되고 화면에 다시 표시되지 않습니다.
        </p>
        <p className={`mt-2 text-sm font-semibold ${pexelsConfigured ? 'text-green-600' : 'text-amber-600'}`}>
          {pexelsConfigured ? '✅ 키 등록됨 — 수집기 사용 중' : '아직 등록 안 됨'}
        </p>
        <input
          type="password"
          value={pexelsKey}
          onChange={(e) => setPexelsKey(e.target.value)}
          placeholder="Pexels API 키 붙여넣기"
          className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void savePexelsKey()}
          disabled={busy || !pexelsKey.trim()}
          className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? '저장 중…' : '키 저장'}
        </button>
      </section>

      {/* ------------------------------------------------ 영상 배경 */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">🎥 실사 배경 영상</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          퀴즈 뒤에 진짜 움직이는 영상이 깔립니다. 아래 버튼 하나면 서버가 저작권 안전한
          라이브러리(위키미디어 CC0/CC BY, 키 설정 시 Pexels·Pixabay)에서 알아서 찾아와
          검증 후 저장합니다. 뉴스·다큐·유명 영상 캡처는 자동으로 거릅니다.
        </p>
        <button
          type="button"
          onClick={() => void runClipImport()}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? '수집 중… (몇 분 걸릴 수 있음)' : '영상 자동 수집 실행'}
        </button>

        {importNotes.length > 0 && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-500">
              시도 상세 (실패 이유 — 캡처해서 공유하면 진단이 빨라집니다)
            </p>
            <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-gray-600">
              {importNotes.join('\n')}
            </pre>
          </div>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs leading-relaxed text-gray-500">
            직접 고르고 싶으면: Pexels/Pixabay/Mixkit에서 다운로드 버튼의 링크 주소를 복사해
            붙여넣으세요 (25MB 이하, 720p면 충분).
          </p>
          <select
            value={clipScene}
            onChange={(e) => setClipScene(e.target.value)}
            className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
          >
            {SCENES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            value={clipUrl}
            onChange={(e) => setClipUrl(e.target.value)}
            placeholder="영상 URL (https://… .mp4)"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            value={clipCredit}
            onChange={(e) => setClipCredit(e.target.value)}
            placeholder="출처 (선택, 예: 작가명 / Pexels)"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void addClip()}
            disabled={busy || !clipUrl.trim()}
            className="mt-3 w-full rounded-xl border border-brand-600 px-4 py-3 text-sm font-semibold text-brand-600 disabled:opacity-50"
          >
            {busy ? '등록 중…' : '이 영상 배경으로 사용하기'}
          </button>

          <label className="mt-3 block">
            <span className="text-xs text-gray-500">
              또는 기기에 받아둔 영상 파일을 직접 업로드 (위에서 고른 씬으로 들어갑니다):
            </span>
            <input
              type="file"
              accept="video/*"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  void uploadFile(
                    '/api/admin/clips',
                    f,
                    { scene: clipScene, credit: clipCredit.trim() },
                    '영상 업로드 완료',
                  );
                e.target.value = '';
              }}
              className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
            />
          </label>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            씬별 영상 풀 (목표 {clipTarget}개씩 · 포스트마다 로테이션)
          </h3>
          <ul className="mt-2 space-y-1">
            {SCENES.map((s) => {
              const pool = clipScenes.find((x) => x.scene === s.id)?.clips ?? [];
              return (
                <li key={s.id} className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-800">{s.label}</span>
                  <span className={pool.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                    {pool.length > 0 ? `영상 ${pool.length}개` : '없음'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ 사진 배경 */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">🎬 실사 배경 사진</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          씬마다 사진 1장. 세로·어두운·중앙이 빈 구도가 좋습니다. 상업 이용 가능한
          라이선스(Pexels 등)만 — 뉴스·다큐 캡처 금지.
        </p>
        <select
          value={photoScene}
          onChange={(e) => setPhotoScene(e.target.value)}
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        >
          {SCENES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="사진 URL (https://…)"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          value={photoCredit}
          onChange={(e) => setPhotoCredit(e.target.value)}
          placeholder="출처 (선택, 예: 작가명 / Pexels)"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void addPhoto()}
          disabled={busy || !photoUrl.trim()}
          className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? '등록 중…' : '이 사진 배경으로 사용하기'}
        </button>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            씬별 상태
          </h3>
          <ul className="mt-2 space-y-1">
            {SCENES.map((s) => {
              const loaded = scenes.find((x) => x.scene === s.id)?.loaded;
              return (
                <li key={s.id} className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-800">{s.label}</span>
                  <span className={loaded ? 'text-green-600' : 'text-gray-400'}>
                    {loaded ? '사진 사용 중' : '코드 배경 (기본)'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
