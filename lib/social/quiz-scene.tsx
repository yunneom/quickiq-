/**
 * Illustrations for quiz cards and reel frames.
 *
 * Scenes are drawn in code (flex boxes + inline SVG that satori renders)
 * rather than shipped as image assets: every question carries different
 * numbers, so the picture has to be generated from the question's own
 * data. This keeps 30+ puzzles illustrated with zero asset hosting.
 *
 * satori constraints that shape this file:
 *   - every element with >1 child needs an explicit `display: flex`
 *   - no CSS transforms/animation; positions are computed as widths
 *   - SVG works, but keep it to plain shapes and paths
 */

/**
 * Scene rows are labelled by their caption, never by a letter: the answer
 * options already own A/B/C/D and a second lettering system on the same
 * card reads as "lane A is answer A".
 */
export type Scene =
  /** Cars/vehicles on tracks — speed & distance puzzles. */
  | {
      kind: 'road';
      lanes: Array<{
        caption: string;
        /** 0–1 along its own track. */
        progress: number;
        /** 0–1 of the available track length, when lanes model different distances. */
        length?: number;
        vehicle?: 'car' | 'train';
      }>;
    }
  /** Number tiles ending in "?" — sequence puzzles. */
  | { kind: 'sequence'; items: string[] }
  /** Labelled horizontal bars — comparison / rate puzzles. */
  | {
      kind: 'bars';
      items: Array<{
        caption: string;
        fill: number;
        /** Shown at the bar's end — given values only, '?' for the unknown. */
        value?: string;
      }>;
    };

/** Side-view vehicle bodies (Material outlines). */
const VEHICLE_PATH = {
  car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 118 14.5 1.5 1.5 0 016.5 16zm11 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  train:
    'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 10H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
} as const;

interface SceneOpts {
  /** Total horizontal space the scene may occupy. */
  width: number;
  /** Square feed cards get a tighter treatment than 9:16 reels. */
  compact?: boolean;
}

function Flag({ size }: { size: number }) {
  const half = Math.round(size / 2);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: size,
        height: size,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', height: half }}>
        <div style={{ display: 'flex', width: half, background: '#FFFFFF' }} />
        <div style={{ display: 'flex', width: half, background: '#111827' }} />
      </div>
      <div style={{ display: 'flex', height: half }}>
        <div style={{ display: 'flex', width: half, background: '#111827' }} />
        <div style={{ display: 'flex', width: half, background: '#FFFFFF' }} />
      </div>
    </div>
  );
}

function RoadScene({
  scene,
  width,
  compact,
}: { scene: Extract<Scene, { kind: 'road' }> } & SceneOpts) {
  const carSize = compact ? 46 : 62;
  const laneH = compact ? 62 : 84;
  const captionSize = compact ? 24 : 32;
  const flag = compact ? 28 : 34;
  const gap = compact ? 16 : 24;
  const maxTrack = width - flag - gap;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 14 : 20,
        width,
      }}
    >
      {scene.lanes.map((lane, i) => {
        const trackW = Math.round(
          maxTrack * Math.min(Math.max(lane.length ?? 1, 0.2), 1),
        );
        const travelled = Math.round(
          Math.max(trackW - carSize, 0) *
            Math.min(Math.max(lane.progress, 0), 1),
        );
        return (
          <div
            key={`${lane.caption}-${i}`}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: captionSize,
                fontWeight: 700,
                marginBottom: compact ? 4 : 8,
              }}
            >
              {lane.caption}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap }}>
              {/* asphalt strip with a dashed centre line and the car on it */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  width: trackW,
                  height: laneH,
                  borderRadius: 16,
                  background: 'rgba(0,0,0,0.30)',
                  borderTop: '3px solid rgba(255,255,255,0.28)',
                  borderBottom: '3px solid rgba(255,255,255,0.28)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: Math.round(laneH / 2) - 2,
                    display: 'flex',
                    width: trackW,
                    height: 4,
                    borderTop: '4px dashed rgba(255,255,255,0.45)',
                  }}
                />
                <div
                  style={{ display: 'flex', position: 'absolute', left: travelled }}
                >
                  <svg width={carSize} height={carSize} viewBox="0 0 24 24">
                    <path
                      d={VEHICLE_PATH[lane.vehicle ?? 'car']}
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>
              </div>

              <Flag size={flag} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SequenceScene({
  scene,
  width,
  compact,
}: { scene: Extract<Scene, { kind: 'sequence' }> } & SceneOpts) {
  const gap = compact ? 12 : 18;
  const count = scene.items.length;
  const tile = Math.min(
    compact ? 118 : 156,
    Math.floor((width - gap * (count - 1)) / count),
  );
  const font = Math.round(tile * (compact ? 0.34 : 0.36));

  return (
    <div style={{ display: 'flex', gap, width, alignItems: 'center' }}>
      {scene.items.map((item, i) => {
        const isUnknown = item === '?';
        return (
          <div
            key={`${item}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: tile,
              height: tile,
              borderRadius: Math.round(tile / 4),
              background: isUnknown ? '#FFE14D' : 'rgba(255,255,255,0.16)',
              color: isUnknown ? '#111827' : '#FFFFFF',
              fontSize: isUnknown ? Math.round(font * 1.2) : font,
              fontWeight: 800,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

function BarsScene({
  scene,
  width,
  compact,
}: { scene: Extract<Scene, { kind: 'bars' }> } & SceneOpts) {
  const barH = compact ? 34 : 44;
  const captionSize = compact ? 24 : 32;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 14 : 20,
        width,
      }}
    >
      {scene.items.map((item, i) => {
        const trackW = width - (item.value ? (compact ? 96 : 128) : 0);
        return (
          <div
            key={`${item.caption}-${i}`}
            style={{ display: 'flex', flexDirection: 'column', width }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: captionSize,
                fontWeight: 700,
                marginBottom: compact ? 4 : 8,
              }}
            >
              {item.caption}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 12 : 16 }}>
              {item.value === '?' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: trackW,
                    height: barH,
                    borderRadius: 999,
                    border: '3px dashed rgba(255,225,77,0.65)',
                    background: 'rgba(0,0,0,0.18)',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    width: trackW,
                    height: barH,
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.28)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: Math.round(trackW * Math.min(Math.max(item.fill, 0.06), 1)),
                      height: barH,
                      borderRadius: 999,
                      background: '#FFE14D',
                    }}
                  />
                </div>
              )}
              {item.value ? (
                <span
                  style={{
                    color: '#FFE14D',
                    fontSize: compact ? 26 : 34,
                    fontWeight: 800,
                  }}
                >
                  {item.value}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Returns the illustration for a scene, or null when there is none. */
export function renderScene(
  scene: Scene | undefined,
  opts: SceneOpts,
): JSX.Element | null {
  if (!scene) return null;
  switch (scene.kind) {
    case 'road':
      return <RoadScene scene={scene} {...opts} />;
    case 'sequence':
      return <SequenceScene scene={scene} {...opts} />;
    case 'bars':
      return <BarsScene scene={scene} {...opts} />;
    default:
      return null;
  }
}
