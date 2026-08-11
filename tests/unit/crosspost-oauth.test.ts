import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

describe('TikTok authorize URL + app-configured detection', () => {
  const originals = {
    key: process.env.TIKTOK_CLIENT_KEY,
    secret: process.env.TIKTOK_CLIENT_SECRET,
  };
  before(() => {
    process.env.TIKTOK_CLIENT_KEY = 'tt-client-key-123';
    process.env.TIKTOK_CLIENT_SECRET = 'tt-client-secret-456';
  });
  after(() => {
    if (originals.key === undefined) delete process.env.TIKTOK_CLIENT_KEY;
    else process.env.TIKTOK_CLIENT_KEY = originals.key;
    if (originals.secret === undefined) delete process.env.TIKTOK_CLIENT_SECRET;
    else process.env.TIKTOK_CLIENT_SECRET = originals.secret;
  });

  it('reports configured only when both key and secret are set', async () => {
    const { isTikTokAppConfigured } = await import('../../lib/social/tiktok');
    assert.equal(isTikTokAppConfigured(), true);
  });

  it('builds an authorize URL carrying the client key, redirect, and state — never the secret', () => {
    // Re-import isn't needed for a pure function read of env at call time,
    // but keep it explicit and local to avoid cross-test module caching
    // surprises.
    return import('../../lib/social/tiktok').then(({ buildTikTokAuthorizeUrl }) => {
      const url = new URL(
        buildTikTokAuthorizeUrl('https://example.com/api/auth/tiktok/callback', 'STATE123'),
      );
      assert.equal(url.origin + url.pathname, 'https://www.tiktok.com/v2/auth/authorize/');
      assert.equal(url.searchParams.get('client_key'), 'tt-client-key-123');
      assert.equal(
        url.searchParams.get('redirect_uri'),
        'https://example.com/api/auth/tiktok/callback',
      );
      assert.equal(url.searchParams.get('state'), 'STATE123');
      assert.equal(url.searchParams.get('response_type'), 'code');
      assert.match(url.searchParams.get('scope') ?? '', /video\.publish/);
      assert.ok(!url.toString().includes('tt-client-secret-456'), 'secret must never leak into the URL');
    });
  });
});

describe('YouTube authorize URL + app-configured detection', () => {
  const originals = {
    id: process.env.YOUTUBE_CLIENT_ID,
    secret: process.env.YOUTUBE_CLIENT_SECRET,
  };
  before(() => {
    process.env.YOUTUBE_CLIENT_ID = 'yt-client-id-789';
    process.env.YOUTUBE_CLIENT_SECRET = 'yt-client-secret-000';
  });
  after(() => {
    if (originals.id === undefined) delete process.env.YOUTUBE_CLIENT_ID;
    else process.env.YOUTUBE_CLIENT_ID = originals.id;
    if (originals.secret === undefined) delete process.env.YOUTUBE_CLIENT_SECRET;
    else process.env.YOUTUBE_CLIENT_SECRET = originals.secret;
  });

  it('reports configured only when both id and secret are set', async () => {
    const { isYouTubeAppConfigured } = await import('../../lib/social/youtube');
    assert.equal(isYouTubeAppConfigured(), true);
  });

  it('builds an authorize URL requesting offline access + consent, never leaking the secret', async () => {
    const { buildYouTubeAuthorizeUrl } = await import('../../lib/social/youtube');
    const url = new URL(
      buildYouTubeAuthorizeUrl('https://example.com/api/auth/youtube/callback', 'STATE456'),
    );
    assert.equal(url.origin + url.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
    assert.equal(url.searchParams.get('client_id'), 'yt-client-id-789');
    assert.equal(
      url.searchParams.get('redirect_uri'),
      'https://example.com/api/auth/youtube/callback',
    );
    assert.equal(url.searchParams.get('state'), 'STATE456');
    // access_type=offline + prompt=consent are what actually guarantees a
    // refresh_token — without both, cross-posting would silently stop
    // working the moment the short-lived access token expires.
    assert.equal(url.searchParams.get('access_type'), 'offline');
    assert.equal(url.searchParams.get('prompt'), 'consent');
    assert.match(url.searchParams.get('scope') ?? '', /youtube\.upload/);
    assert.ok(!url.toString().includes('yt-client-secret-000'), 'secret must never leak into the URL');
  });
});
