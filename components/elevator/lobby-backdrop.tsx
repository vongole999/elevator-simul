import { getThemePalette, type ElevatorTheme, type ThemePalette } from "./theme";

interface LobbyBackdropProps {
  theme: ElevatorTheme;
  /** 이 문이 속한 층. 창밖 풍경·장식을 층마다 결정론적으로 다르게 흔드는 시드로 쓴다. */
  floor: number;
}

/** floor·salt로 결정되는 0~1 사이 의사난수. 같은 층은 늘 같은 모습이라 재렌더링에도 깜빡이지 않는다. */
function seeded(floor: number, salt: number): number {
  const x = Math.sin(floor * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * 문이 열렸을 때 보이는 로비 풍경. 실제 사진 대신 SVG로 직접 그려, 분위기
 * (테마)마다 완전히 다른 공간처럼 보이게 하고 층마다도 창밖 풍경·장식을
 * 조금씩 다르게 흔든다. 어두워서 뭔지 안 보이던 이전 버전과 달리 벽·바닥을
 * 밝은 톤으로 그려 사물이 뚜렷이 구분되게 한다.
 */
export function LobbyBackdrop({ theme, floor }: LobbyBackdropProps) {
  const palette = getThemePalette(theme);
  const isBasement = floor < 0;
  const isGroundLobby = floor === 1;

  return (
    <svg
      viewBox="0 0 200 250"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      {theme === "modern" && (
        <ModernLobby floor={floor} isBasement={isBasement} isGroundLobby={isGroundLobby} palette={palette} />
      )}
      {theme === "classic" && (
        <ClassicLobby floor={floor} isBasement={isBasement} isGroundLobby={isGroundLobby} palette={palette} />
      )}
      {theme === "spaceship" && (
        <SpaceshipLobby floor={floor} isBasement={isBasement} isGroundLobby={isGroundLobby} palette={palette} />
      )}
    </svg>
  );
}

interface SceneProps {
  floor: number;
  isBasement: boolean;
  isGroundLobby: boolean;
  palette: ThemePalette;
}

/** 지상층 창밖 하늘: 층이 높을수록 더 밝고 맑아진다(구름 위로 올라가는 느낌). */
function skyBrightness(floor: number): number {
  return Math.max(0, Math.min(1, floor / 16));
}

// ---------------------------------------------------------------------------
// modern: 화이트톤 오피스 로비. 통유리창 너머 도시 스카이라인, 미니멀 화분.
// ---------------------------------------------------------------------------
function ModernLobby({ floor, isBasement, isGroundLobby, palette }: SceneProps) {
  const bright = skyBrightness(floor);
  const skyTop = isBasement ? "#dde3ea" : mixHex(palette.skyFrom, "#ffffff", bright * 0.4);
  const buildingHeights = [0.3, 0.55, 0.4, 0.7, 0.35].map((h, i) => h + seeded(floor, i) * 0.15);

  return (
    <>
      <rect width="200" height="250" fill={`url(#modern-wall-${floor})`} />
      <defs>
        <linearGradient id={`modern-wall-${floor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.sceneWallFrom} />
          <stop offset="100%" stopColor={palette.sceneWallTo} />
        </linearGradient>
        <linearGradient id={`modern-sky-${floor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={isBasement ? "#c4ccd4" : palette.skyTo} />
        </linearGradient>
      </defs>

      {/* 매입 다운라이트 */}
      {[38, 100, 162].map((x) => (
        <circle key={x} cx={x} cy={10} r={5} fill="#fff9ec" opacity={0.9} />
      ))}

      {isBasement ? (
        // 지하: 창문 대신 환기 덕트와 안내 표지판
        <g>
          <rect x={20} y={20} width={160} height={26} rx={4} fill="#aab2bd" />
          <rect x={20} y={20} width={160} height={7} fill="#c7cdd6" />
          {[45, 90, 135].map((x) => (
            <rect key={x} x={x} y={30} width={14} height={6} rx={2} fill="#7c8794" />
          ))}
          <rect x={78} y={60} width={44} height={16} rx={2} fill="#38bdf8" opacity={0.85} />
          <text x={100} y={71} fontSize={9} fill="#ffffff" textAnchor="middle" fontWeight={700}>
            P{Math.abs(floor)}
          </text>
        </g>
      ) : (
        // 지상: 통유리창 + 스카이라인
        <g>
          <rect x={16} y={14} width={168} height={92} rx={3} fill={`url(#modern-sky-${floor})`} />
          {buildingHeights.map((h, i) => {
            const w = 20;
            const x = 24 + i * 34;
            const height = 20 + h * 55;
            return <rect key={i} x={x} y={106 - height} width={w} height={height} fill="#ffffff" opacity={0.55} />;
          })}
          <circle cx={40 + seeded(floor, 9) * 100} cy={30} r={9} fill="#ffffff" opacity={0.8} />
          {/* 창틀 멀리언 */}
          {[16, 58, 100, 142, 184].map((x) => (
            <rect key={x} x={x - 1} y={14} width={2} height={92} fill="#c7cad0" />
          ))}
          <rect x={16} y={14} width={168} height={92} rx={3} fill="none" stroke="#b7bcc4" strokeWidth={2} />
        </g>
      )}

      {/* 액자 */}
      <rect x={150} y={126} width={30} height={38} rx={2} fill="#ffffff" stroke="#c7cad0" strokeWidth={2} />
      <rect x={155} y={131} width={20} height={28} fill={palette.sceneAccent} opacity={0.35} />

      {/* 바닥(원근감) */}
      <polygon points="60,250 140,250 172,162 28,162" fill={palette.sceneFloor} />
      <polygon points="60,250 140,250 172,162 28,162" fill="url(#modern-floor-sheen)" opacity={0.5} />
      <defs>
        <linearGradient id="modern-floor-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="50%" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 화분 */}
      <ModernPlant x={34} y={196} scale={1} />
      <ModernPlant x={158} y={200} scale={0.9} />

      {isGroundLobby && (
        <g>
          <rect x={78} y={214} width={44} height={20} rx={3} fill="#ffffff" stroke="#b7bcc4" strokeWidth={2} />
          <rect x={78} y={214} width={44} height={5} fill={palette.sceneAccent} opacity={0.7} />
        </g>
      )}
    </>
  );
}

function ModernPlant({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-9} y={0} width={18} height={22} rx={2} fill="#e5e7eb" stroke="#b7bcc4" strokeWidth={1.5} />
      <path d="M0 0 L-10 -26 L-2 -14 L0 -30 L4 -15 L10 -24 Z" fill="#4d7c5f" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// classic: 우드 패널 + 대리석 + 샹들리에. 화려한 몰딩으로 고급스럽게.
// ---------------------------------------------------------------------------
function ClassicLobby({ floor, isBasement, isGroundLobby, palette }: SceneProps) {
  const panelXs = [10, 46, 82, 118, 154];

  return (
    <>
      <rect width="200" height="250" fill={`url(#classic-wall-${floor})`} />
      <defs>
        <linearGradient id={`classic-wall-${floor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.sceneWallFrom} />
          <stop offset="100%" stopColor={palette.sceneWallTo} />
        </linearGradient>
      </defs>

      {/* 우드 패널 세로 몰딩 */}
      {panelXs.map((x) => (
        <rect key={x} x={x} y={16} width={26} height={130} rx={3} fill="none" stroke={palette.frameTrim} strokeWidth={1.5} opacity={0.6} />
      ))}

      {isBasement ? (
        <g>
          <rect x={70} y={26} width={60} height={14} rx={3} fill={palette.frameTrim} opacity={0.85} />
          <text x={100} y={36} fontSize={8} fill="#3a2614" textAnchor="middle" fontWeight={700}>
            WINE CELLAR
          </text>
        </g>
      ) : (
        <g>
          {/* 아치형 창 */}
          <path d="M60 90 L60 40 A40 40 0 0 1 140 40 L140 90 Z" fill="#3a2614" opacity={0.5} />
          <path d="M60 90 L60 40 A40 40 0 0 1 140 40 L140 90 Z" fill="none" stroke={palette.frameTrim} strokeWidth={3} />
          <circle cx={100} cy={60} r={14} fill="#ffe9b0" opacity={0.55} />
        </g>
      )}

      {/* 샹들리에 */}
      <g>
        <line x1={100} y1={0} x2={100} y2={18} stroke={palette.frameTrim} strokeWidth={2} />
        <ellipse cx={100} cy={22} rx={22} ry={6} fill="none" stroke={palette.frameTrim} strokeWidth={2} />
        {[-16, -8, 0, 8, 16].map((dx) => (
          <line key={dx} x1={100 + dx} y1={24} x2={100 + dx * 0.6} y2={34} stroke={palette.frameTrim} strokeWidth={1.5} />
        ))}
        {[-16, -8, 0, 8, 16].map((dx) => (
          <circle key={dx} cx={100 + dx * 0.6} cy={35} r={2.6} fill="#ffe9b0" />
        ))}
      </g>

      {/* 금테 액자(초상화 실루엣) */}
      <rect x={18} y={100} width={26} height={34} rx={2} fill="#3a2614" stroke={palette.frameTrim} strokeWidth={2.5} />
      <ellipse cx={31} cy={116} rx={7} ry={9} fill="#c9a25a" opacity={0.7} />

      {/* 바닥: 버건디 카펫 + 다이아몬드 패턴 */}
      <polygon points="58,250 142,250 174,162 26,162" fill={palette.sceneFloor} />
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => {
          const t = row / 4;
          const yTop = 162 + t * 88;
          const spanLeft = 26 + t * 32;
          const spanRight = 174 - t * 32;
          const width = spanRight - spanLeft;
          const cx = spanLeft + (width / 6) * (col + 0.5);
          const cy = yTop + 8;
          const size = 4 + t * 4;
          return (
            <rect
              key={`${row}-${col}`}
              x={cx - size / 2}
              y={cy - size / 2}
              width={size}
              height={size}
              transform={`rotate(45 ${cx} ${cy})`}
              fill={palette.frameTrim}
              opacity={0.25}
            />
          );
        })
      )}
      <polygon points="58,250 142,250 174,162 26,162" fill="none" stroke={palette.frameTrim} strokeWidth={2} opacity={0.6} />

      {isGroundLobby && (
        <g>
          {/* 화병 장식 */}
          <path d="M100 246 L92 210 Q100 200 108 210 L100 246 Z" fill="#c9a25a" opacity={0.8} />
          <ellipse cx={100} cy={210} rx={9} ry={4} fill="#e8c988" />
        </g>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// spaceship: 다크 메탈 + 네온 + 우주 창. 홀로그램 패널로 미래적인 느낌.
// ---------------------------------------------------------------------------
function SpaceshipLobby({ floor, isBasement, palette }: SceneProps) {
  const stars = Array.from({ length: 22 }).map((_, i) => ({
    x: seeded(floor, i) * 168 + 16,
    y: seeded(floor, i + 50) * 70 + 12,
    r: 0.6 + seeded(floor, i + 90) * 1.2,
  }));

  return (
    <>
      <rect width="200" height="250" fill={`url(#ship-wall-${floor})`} />
      <defs>
        <linearGradient id={`ship-wall-${floor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.sceneWallFrom} />
          <stop offset="100%" stopColor={palette.sceneWallTo} />
        </linearGradient>
        <radialGradient id={`ship-window-${floor}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#1c2c46" />
          <stop offset="100%" stopColor="#050810" />
        </radialGradient>
      </defs>

      {/* 패널 솔기 격자 */}
      {[0, 50, 100, 150, 200].map((x) => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={250} stroke={palette.frameTrim} strokeOpacity={0.12} strokeWidth={1} />
      ))}
      {[0, 60, 120, 180, 240].map((y) => (
        <line key={`h${y}`} x1={0} y1={y} x2={200} y2={y} stroke={palette.frameTrim} strokeOpacity={0.12} strokeWidth={1} />
      ))}

      {isBasement ? (
        // 지하(엔진/기계) 구역: 파이프와 계기판
        <g>
          <rect x={20} y={20} width={160} height={70} rx={6} fill="#0b1220" stroke={palette.frameTrim} strokeWidth={1.5} opacity={0.9} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={34 + i * 46} y={32} width={30} height={30} rx={4} fill="#0e1a2c" stroke={palette.frameTrim} strokeWidth={1} />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={49 + i * 46} cy={47} r={9} fill="none" stroke="#22d3ee" strokeWidth={1.5} opacity={0.8} />
          ))}
          <line x1={20} y1={98} x2={180} y2={98} stroke="#334155" strokeWidth={4} />
        </g>
      ) : (
        // 지상: 캡슐형 창으로 보이는 우주
        <g>
          <ellipse cx={100} cy={58} rx={72} ry={48} fill={`url(#ship-window-${floor})`} />
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={Math.min(s.y, 100)} r={s.r} fill="#e2f6ff" opacity={0.85} />
          ))}
          <circle
            cx={60 + seeded(floor, 5) * 80}
            cy={40 + seeded(floor, 6) * 24}
            r={9 + seeded(floor, 7) * 5}
            fill="#7dd3fc"
            opacity={0.5}
          />
          <ellipse cx={100} cy={58} rx={72} ry={48} fill="none" stroke="#22d3ee" strokeWidth={2.5} opacity={0.8} />
          <ellipse cx={100} cy={58} rx={78} ry={54} fill="none" stroke="#0e7490" strokeWidth={4} opacity={0.6} />
        </g>
      )}

      {/* 홀로그램 패널 */}
      <g opacity={0.85}>
        <rect x={22} y={112} width={34} height={26} rx={2} fill="#0b1220" stroke="#22d3ee" strokeWidth={1.5} />
        <line x1={26} y1={120} x2={52} y2={120} stroke="#22d3ee" strokeWidth={1} opacity={0.8} />
        <line x1={26} y1={126} x2={46} y2={126} stroke="#22d3ee" strokeWidth={1} opacity={0.6} />
        <line x1={26} y1={132} x2={50} y2={132} stroke="#22d3ee" strokeWidth={1} opacity={0.4} />
      </g>

      {/* 바닥: 다크 메탈 + 네온 라인 */}
      <polygon points="58,250 142,250 174,162 26,162" fill={palette.sceneFloor} />
      <polygon points="58,250 142,250 174,162 26,162" fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.9} />
      <line x1={100} y1={162} x2={100} y2={250} stroke="#22d3ee" strokeWidth={1.5} opacity={0.55} />
      {[0.3, 0.6, 0.85].map((t, i) => {
        const y = 162 + t * 88;
        const spanLeft = 26 + t * 32;
        const spanRight = 174 - t * 32;
        return <line key={i} x1={spanLeft} y1={y} x2={spanRight} y2={y} stroke="#22d3ee" strokeWidth={1} opacity={0.3} />;
      })}
    </>
  );
}

/** hex 색 두 개를 t(0~1) 비율로 섞는다. 층수에 따른 하늘 밝기 보정에 쓴다. */
function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bch = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
