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

    const map = svg
      .selectAll("path")
      .append("g")
      .attr("class", "map1")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("d", geoGenerator)
      .attr("fill", "#69b3a2")
      .on("mouseover", function (e, d) {
        d3.select(this).attr("fill", "#63ABFF");
        const center = geoGenerator.centroid(d);
        svg
          .append("circle")
          .attr("cx", center[0])
          .attr("cy", center[1])
          .attr("r", 5)
          .attr("fill", "none")
          .attr("stroke", "black")
          .classed("ac", true);

        console.log(center);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#69b3a2");
        d3.selectAll(".ac").remove();
      });

    svg
      .selectAll(".place-label")
      .data(mapData.features)
      .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", function (d) {
        return "translate(" + geoGenerator.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .text(function (d) {
        return d.properties?.name;
      });

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
      d3.select(".map1").attr("transform", e.transform.toString());
    }
  }, []);

  return <div ref={ref}>D3Map</div>;
}
