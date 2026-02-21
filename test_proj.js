import { geoMercator } from "d3-geo";
const INDIA_COORDS = [78.9629, 20.5937];
const width = 800;
const height = 450;
const projection = geoMercator()
  .scale(120)
  .translate([width / 2, height / 1.5]);
console.log(projection(INDIA_COORDS));
