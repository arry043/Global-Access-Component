import React, { useEffect, useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, useAnimation, useInView } from 'framer-motion';
import { geoMercator } from "d3-geo";

const geoUrl = "/world-110m.json";
const INDIA_COORDS: [number, number] = [78.9629, 20.5937];
const UAE_COORDS: [number, number] = [53.8478, 23.4241];
const USA_COORDS: [number, number] = [-95.7129, 37.0902];
const width = 1200;
const height = 800;

const projection = geoMercator()
  .scale(140)
  .center([-10, 30])
  .translate([width / 2, height / 2]);

const indiaPoint = projection(INDIA_COORDS) || [0, 0];
const uaePoint = projection(UAE_COORDS) || [0, 0];
const usaPoint = projection(USA_COORDS) || [0, 0];

const MapWidget: React.FC = () => {
  const [highlightedCountries, setHighlightedCountries] = useState<string[]>(['IND']);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 }); // जब सेक्शन 30% दिखेगा तब एनिमेशन शुरू होगा

  const mapControls = useAnimation();
  const line1Controls = useAnimation();
  const label1Controls = useAnimation();
  const line2Controls = useAnimation();
  const label2Controls = useAnimation();

  // ज़ूम के लिए इंडिया का सेंटर कैलकुलेशन
  const INITIAL_SCALE = 3.5; 
  const initialX = width / 2 - indiaPoint[0] * INITIAL_SCALE;
  const initialY = height / 2 - indiaPoint[1] * INITIAL_SCALE;

  useEffect(() => {
    if (!isInView) return; // जब तक व्यू में नहीं है, तब तक रुके रहें

    const sequence = async () => {
      // 1. सबसे पहले लाइन्स को हाइड रखें
      await Promise.all([
        line1Controls.set({ pathLength: 0, opacity: 0 }),
        label1Controls.set({ opacity: 0 }),
        line2Controls.set({ pathLength: 0, opacity: 0 }),
        label2Controls.set({ opacity: 0 }),
      ]);

      // 2. 0.4 सेकंड में ज़ूम आउट करें
      await mapControls.start({
        scale: 1.5,
        x: 0,
        y: 0,
        transition: { duration: 0.5, ease: "easeInOut" }
      });

      // ज़ूम आउट होने के बाद थोड़ा सा (300ms) पॉज़ लें
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. अपना नॉर्मल कनेक्शन लूप शुरू करें
      while (true) {
        // Step 1: UAE
        await line1Controls.start({ pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } });
        await label1Controls.start({ opacity: 1, transition: { duration: 0.2 } });
        setHighlightedCountries(prev => [...prev, 'ARE']);

        // Step 2: USA
        await line2Controls.start({ pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } });
        await label2Controls.start({ opacity: 1, transition: { duration: 0.2 } });
        setHighlightedCountries(prev => [...prev, 'USA']);

        // Hold
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Reset
        await Promise.all([
          line1Controls.set({ pathLength: 0, opacity: 0 }),
          label1Controls.set({ opacity: 0 }),
          line2Controls.set({ pathLength: 0, opacity: 0 }),
          label2Controls.set({ opacity: 0 }),
        ]);
        setHighlightedCountries(['IND']);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };
    
    sequence();
  }, [isInView, mapControls, line1Controls, label1Controls, line2Controls, label2Controls]);

  const calculatePath = (p1: [number, number], p2: [number, number], curveOffset = 0.3) => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const cx = p1[0] + dx * 0.5 - dy * curveOffset;
    const cy = p1[1] + dy * 0.5 + dx * curveOffset;
    return `M ${p1[0]},${p1[1]} Q ${cx},${cy} ${p2[0]},${p2[1]}`;
  };

  const pathUae = calculatePath(indiaPoint as [number, number], uaePoint as [number, number], 0.2);
  const pathUsa = calculatePath(indiaPoint as [number, number], usaPoint as [number, number], -0.3);

  const neonColor = "#06b6d4";
  const neonGlow = "drop-shadow(0 0 5px #06b6d4)";
  const neonTextGlow = "drop-shadow(0 0 3px #06b6d4)";

  // फॉन्ट की स्टाइलिंग जो सब जगह कॉमन रहेगी (14px साइज़)
  const commonTextStyle = {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fill: "#fff",
    fontWeight: 600,
    filter: neonTextGlow,
    letterSpacing: "0.05em"
  };

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden bg-[#0a0f1d] flex items-center justify-center relative">
      <div className="w-full h-full relative" style={{ maxWidth: 1400 }}>
        <ComposableMap projection={projection as any} className="w-full h-full" width={width} height={height}>
          
          {/* सारी चीज़ों को एक motion.g में रैप किया है ताकि सब एक साथ ज़ूम हो */}
          <motion.g
            initial={{ scale: INITIAL_SCALE, x: initialX, y: initialY }} // शुरू में इंडिया पर ज़ूम रहेगा
            animate={mapControls}
            style={{ transformOrigin: "0px 0px" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => {
                  // फिक्स: एक्स्ट्रा मैप (अंटार्कटिका) को हाईड कर रहे हैं
                  if (geo.properties?.name === "Antarctica" || geo.id === "ATA") return null;

                  const isHighlighted = highlightedCountries.some(h => {
                    const target = h.toUpperCase();
                    const geoId = geo.id ? String(geo.id).toUpperCase() : "";
                    const iso3 = geo.properties?.iso_a3 ? String(geo.properties.iso_a3).toUpperCase() : "";
                    const name = geo.properties?.name ? String(geo.properties.name).toUpperCase() : "";

                    return geoId === target || iso3 === target || 
                           (name === "INDIA" && target === "IND") ||
                           (name === "UNITED ARAB EMIRATES" && target === "ARE") ||
                           (name === "UNITED STATES OF AMERICA" && target === "USA");
                  });

                  const fillColor = isHighlighted ? "rgba(6, 182, 212, 0.4)" : "var(--map-land, #1a1a1a)";
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="var(--map-border, #333333)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "fill 0.5s ease" },
                        hover: { outline: "none", fill: "#1a2542" },
                        pressed: { outline: "none" },
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {/* UAE Path & Label */}
            <motion.path d={pathUae} fill="transparent" stroke={neonColor} strokeWidth="1.5" strokeDasharray="4 4" style={{ filter: neonGlow }} animate={line1Controls} />
            <motion.g animate={label1Controls}>
              <circle cx={uaePoint[0]} cy={uaePoint[1]} r={3} fill={neonColor} style={{ filter: neonGlow }} />
              <text x={uaePoint[0]} y={uaePoint[1] - 10} textAnchor="middle" style={commonTextStyle}>UAE</text>
            </motion.g>

            {/* USA Path & Label */}
            <motion.path d={pathUsa} fill="transparent" stroke={neonColor} strokeWidth="1.5" strokeDasharray="4 4" style={{ filter: neonGlow }} animate={line2Controls} />
            <motion.g animate={label2Controls}>
              <circle cx={usaPoint[0]} cy={usaPoint[1]} r={3} fill={neonColor} style={{ filter: neonGlow }} />
              <text x={usaPoint[0]} y={usaPoint[1] - 10} textAnchor="middle" style={commonTextStyle}>USA</text>
            </motion.g>

            {/* India Marker */}
            <Marker coordinates={INDIA_COORDS}>
              <g style={{ filter: neonGlow }}>
                <circle r={3} fill={neonColor} />
              </g>
              <text x={10} y={4} style={commonTextStyle}>
                Flash Space
              </text>
            </Marker>

          </motion.g>
        </ComposableMap>
      </div>
    </div>
  );
};

export default MapWidget;