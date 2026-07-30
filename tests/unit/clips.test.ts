import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pickClipForSlot, type ClipEntry } from '../../lib/social/clips';
import {
  commonsLicenseAllowed,
  commonsPageToCandidate,
  pexelsVideoToCandidate,
  pixabayHitToCandidate,
  stripHtml,
  SCENE_QUERIES,
} from '../../lib/social/clip-sources';
import type { BgScene } from '../../lib/social/reel-bg';

describe('commonsLicenseAllowed', () => {
  it('accepts CC0 / public domain without attribution', () => {
    for (const name of ['CC0', 'Public domain', 'PD-US', 'No restrictions']) {
      const r = commonsLicenseAllowed(name);
      assert.equal(r.allowed, true, name);
      assert.equal(r.requiresAttribution, false, name);
    }
  });

  it('accepts plain CC BY, flagged for attribution', () => {
    for (const name of ['CC BY 4.0', 'CC BY 2.0', 'CC BY-3.0', 'CC BY']) {
      const r = commonsLicenseAllowed(name);
      assert.equal(r.allowed, true, name);
      assert.equal(r.requiresAttribution, true, name);
    }
  });

  it('rejects SA / NC / ND riders and everything unrecognized', () => {
    for (const name of [
      'CC BY-SA 4.0',
      'CC BY-NC 2.0',
      'CC BY-ND 4.0',
      'CC BY-NC-SA 3.0',
      'GFDL',
      'Copyrighted free use', // ambiguous → reject
      '',
      undefined,
    ]) {
      const r = commonsLicenseAllowed(name);
      assert.equal(r.allowed, false, String(name));
    }
  });
});

describe('commonsPageToCandidate', () => {
  const basePage = {
    title: 'File:Train approaching.webm',
    videoinfo: [
      {
        url: 'https://upload.wikimedia.org/original.webm',
        mime: 'video/webm',
        size: 12_000_000,
        width: 1920,
        height: 1080,
        duration: 22.4,
        derivatives: [
          { src: 'https://upload.wikimedia.org/240p.webm', type: 'video/webm', width: 426, height: 240 },
          { src: 'https://upload.wikimedia.org/720p.webm', type: 'video/webm', width: 1280, height: 720 },
          { src: 'https://upload.wikimedia.org/1080p.webm', type: 'video/webm', width: 1920, height: 1080 },
        ],
        extmetadata: {
          LicenseShortName: { value: 'CC BY 4.0' },
          Artist: { value: '<a href="https://example.com">Jane Doe</a>' },
        },
      },
    ],
  };

  it('builds a candidate from the smallest usable derivative', () => {
    const c = commonsPageToCandidate(basePage, 'rails');
    assert.ok(c);
    assert.equal(c!.url, 'https://upload.wikimedia.org/720p.webm');
    assert.equal(c!.requiresAttribution, true);
    assert.equal(c!.credit, 'Jane Doe');
    assert.ok(c!.id.startsWith('commons-'));
    assert.ok(c!.sourcePage!.includes('commons.wikimedia.org/wiki/'));
  });

  it('rejects ShareAlike pages outright', () => {
    const page = structuredClone(basePage);
    page.videoinfo[0].extmetadata.LicenseShortName = { value: 'CC BY-SA 4.0' };
    assert.equal(commonsPageToCandidate(page, 'rails'), null);
  });

  it('rejects durations outside the loopable range', () => {
    for (const duration of [2, 3600]) {
      const page = structuredClone(basePage);
      page.videoinfo[0].duration = duration;
      assert.equal(commonsPageToCandidate(page, 'rails'), null);
    }
  });

  it('rejects when only tiny derivatives exist and the original is too big', () => {
    const page = structuredClone(basePage);
    page.videoinfo[0].derivatives = [
      { src: 'https://upload.wikimedia.org/240p.webm', type: 'video/webm', width: 426, height: 240 },
    ];
    page.videoinfo[0].size = 500_000_000;
    assert.equal(commonsPageToCandidate(page, 'rails'), null);
  });
});

describe('pexelsVideoToCandidate', () => {
  const video = {
    id: 857266,
    duration: 15,
    user: { name: 'Some Author' },
    url: 'https://www.pexels.com/video/857266/',
    video_files: [
      { link: 'https://videos.pexels.com/sd.mp4', width: 640, height: 360, file_type: 'video/mp4' },
      { link: 'https://videos.pexels.com/hd.mp4', width: 1280, height: 720, file_type: 'video/mp4' },
      { link: 'https://videos.pexels.com/uhd.mp4', width: 3840, height: 2160, file_type: 'video/mp4' },
    ],
  };

  it('picks the smallest rendition that survives the crop, no attribution', () => {
    const c = pexelsVideoToCandidate(video, 'road');
    assert.ok(c);
    assert.equal(c!.url, 'https://videos.pexels.com/hd.mp4');
    assert.equal(c!.requiresAttribution, false);
    assert.equal(c!.id, 'pexels-857266');
  });

  it('rejects clips that are too short to loop well', () => {
    assert.equal(pexelsVideoToCandidate({ ...video, duration: 3 }, 'road'), null);
  });
});

describe('pixabayHitToCandidate', () => {
  it('prefers the medium rendition and carries the author', () => {
    const c = pixabayHitToCandidate(
      {
        id: 1234,
        duration: 30,
        user: 'someone',
        pageURL: 'https://pixabay.com/videos/id-1234/',
        videos: {
          large: { url: 'https://cdn.pixabay.com/large.mp4', width: 1920, height: 1080, size: 20_000_000 },
          medium: { url: 'https://cdn.pixabay.com/medium.mp4', width: 1280, height: 720, size: 8_000_000 },
          small: { url: 'https://cdn.pixabay.com/small.mp4', width: 640, height: 360, size: 2_000_000 },
        },
      },
      'road',
    );
    assert.ok(c);
    assert.equal(c!.url, 'https://cdn.pixabay.com/medium.mp4');
    assert.equal(c!.requiresAttribution, false);
  });
});

describe('pickClipForSlot', () => {
  const pool: ClipEntry[] = [
    { id: 'b', scene: 'rails', storedAt: 'x' },
    { id: 'a', scene: 'rails', storedAt: 'x' },
    { id: 'c', scene: 'road', storedAt: 'x' },
  ];

  it('is deterministic and cycles the scene pool', () => {
    const first = pickClipForSlot('rails', 10, 0, pool);
    assert.equal(first, pickClipForSlot('rails', 10, 0, pool));
    const second = pickClipForSlot('rails', 10, 1, pool);
    assert.notEqual(first!.id, second!.id);
  });

  it('never returns a clip from another scene, null on empty pool', () => {
    for (let day = 0; day < 5; day++) {
      for (let slot = 0; slot < 3; slot++) {
        assert.equal(pickClipForSlot('road', day, slot, pool)!.id, 'c');
      }
    }
    assert.equal(pickClipForSlot('chalk', 0, 0, pool), null);
  });
});

describe('scene queries and helpers', () => {
  it('every scene has at least one search query', () => {
    const scenes: BgScene[] = ['rails', 'road', 'chalk', 'slate'];
    for (const scene of scenes) {
      assert.ok(SCENE_QUERIES[scene].length >= 1, scene);
    }
  });

  it('stripHtml flattens Commons artist markup', () => {
    assert.equal(stripHtml('<a href="x"><b>Jane</b> Doe</a>'), 'Jane Doe');
    assert.equal(stripHtml(undefined), '');
  });
});
