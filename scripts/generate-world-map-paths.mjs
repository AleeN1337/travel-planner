import { geoPath, geoEquirectangular } from "d3-geo";
import { feature } from "topojson-client";
import { writeFileSync } from "fs";

const WIDTH = 2000;
const HEIGHT = 1000;

const topo = await fetch(
  "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json",
).then((r) => r.json());

const land = feature(topo, topo.objects.land);

const projection = geoEquirectangular()
  .fitExtent(
    [
      [20, 30],
      [WIDTH - 20, HEIGHT - 30],
    ],
    land,
  );

const path = geoPath(projection);

const d = path(land);
if (!d) throw new Error("Failed to generate path");

const out = `/** Auto-generated from Natural Earth 110m via world-atlas — do not edit by hand */
export const WORLD_LAND_PATH = ${JSON.stringify(d)};
`;

writeFileSync("src/lib/map/world-land-path.ts", out);
console.log("Wrote src/lib/map/world-land-path.ts", d.length, "chars");
