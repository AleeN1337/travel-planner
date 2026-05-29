import { WORLD_LAND_PATH } from "@/lib/map/world-land-path";

/** Stonowana mapa świata (Natural Earth 110m) — warstwa tła */
export function WorldMapBackground() {
  return (
    <div
      aria-hidden
      className="travel-bg-layer travel-bg-world pointer-events-none"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 2000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mapGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.14 210)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="oklch(0.68 0.12 55)" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Siatka geograficzna (co 30°) */}
        <g stroke="oklch(0.78 0.06 240)" strokeOpacity="0.12" strokeWidth="1">
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = ((90 - lat) / 180) * 1000;
            return (
              <line key={`lat-${lat}`} x1={0} y1={y} x2={2000} y2={y} />
            );
          })}
          {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((lon) => {
            const x = ((lon + 180) / 360) * 2000;
            return (
              <line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={1000} />
            );
          })}
        </g>

        {/* Lądy — rzeczywiste kontury (Natural Earth 110m) */}
        <path
          d={WORLD_LAND_PATH}
          fill="url(#mapGlow)"
          stroke="oklch(0.82 0.1 210)"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Łuki tras (w przybliżeniu rzeczywiste połączenia) */}
        <g
          fill="none"
          stroke="oklch(0.78 0.12 195)"
          strokeOpacity="0.32"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M 520 295 C 760 210, 980 230, 1045 248" />
          <path d="M 1045 248 C 1280 320, 1520 360, 1685 310" />
          <path d="M 1045 248 C 1120 420, 1180 560, 1785 655" />
          <path d="M 520 295 C 560 480, 590 620, 615 655" />
        </g>

        {/* Punkty (NYC, Londyn, Tokio, Sydney, São Paulo) */}
        <g fill="oklch(0.9 0.08 210)" fillOpacity="0.8">
          <circle cx="520" cy="295" r="4.5" />
          <circle cx="1045" cy="248" r="4.5" />
          <circle cx="1685" cy="310" r="4.5" />
          <circle cx="1785" cy="655" r="4.5" />
          <circle cx="615" cy="655" r="4.5" />
        </g>
      </svg>
    </div>
  );
}
