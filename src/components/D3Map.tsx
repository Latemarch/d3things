"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FeatureCollection } from "geojson";

interface Props {
  mapData: FeatureCollection;
  height?: number;
  width?: number;
}

export default function D3Map({ mapData, height = 300, width = 600 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const xScale = d3.scaleLinear([0, width], [0, width]);

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("border", "2px solid steelblue");

    const projection = d3
      .geoEquirectangular()
      .scale(width / 7)
      .translate([width / 2, height / 2]);

    const map = svg
      .append("g")
      .selectAll("path")
      .data(mapData.features)
      .join("path")
      .attr("fill", "#69b3a2")
      .attr("d", d3.geoPath().projection(projection));

    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([0.1, 20])
      .translateExtent([
        [0, 0],
        [width, height],
      ]);
    svg.call(zoom as any);

    function handleZoom(e: d3.D3ZoomEvent<SVGElement, unknown>) {
      const newScale = e.transform.rescaleX(xScale);
      const duration = 50;
      console.log(e.transform.toString());
      map
        .transition()
        .duration(duration)
        .attr("transform", e.transform.toString());
    }
  }, []);

  return <div ref={ref}>D3Map</div>;
}
