import React from 'react';
import { renderToString } from 'react-dom/server';
import MapWidget from './src/components/MapWidget.js'; // Wait, let me just build it?
// Let me just import from src
import { ComposableMap, Marker } from "react-simple-maps";
import { geoMercator } from "d3-geo";

const width = 800;
const height = 450;
const projection = geoMercator()
  .scale(120)
  .translate([width / 2, height / 1.5]);

const App = () => {
  return (
    <ComposableMap projection={() => projection}>
      <Marker coordinates={[78.9629, 20.5937]}>
        <circle r={2.5} />
      </Marker>
    </ComposableMap>
  );
};

try {
  console.log("Rendering...");
  console.log(renderToString(<App />));
} catch (e) {
  console.error("ERRORED!", e);
}
