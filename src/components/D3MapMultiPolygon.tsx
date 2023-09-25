"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";

interface Props {
  mapData: Feature;
  height?: number;
  width?: number;
}
const initialScaleRef = {
  scaleX: (x: number) => x,
  scaleY: (y: number) => y,
};

export default function D3MapMultiPolygon({
  mapData,
  height = 300,
  width = 600,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<{ [key: string]: (x: number) => number }>(
    initialScaleRef
  );
  console.log(mapData);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("border", "2px solid steelblue");

    const projection = d3.geoEquirectangular().fitExtent(
      [
        [10, 10],
        [width - 10, height - 10],
      ],
      mapData
    );

    const geoGenerator = d3.geoPath().projection(projection);

    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([1, 2000])
      .translateExtent([
        [0, 0],
        [width, height],
      ]);
    svg.call(zoom as any);

    function handleZoom(e: d3.D3ZoomEvent<SVGElement, unknown>) {
      const scaleX = (x: number) => e.transform.applyX(x);
      const scaleY = (y: number) => e.transform.applyY(y);
      scaleRef.current = { scaleX, scaleY };
      // map.attr("transform", e.transform.toString());
      // text.attr("transform", function (d) {
      //   const [x, y] = geoGenerator.centroid(d);
      //   return `translate(${scaleX(x)},${scaleY(y)})`;
      // });
    }
  }, []);

  return <div ref={ref}>D3Map</div>;
}
