"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FeatureCollection } from "geojson";

interface Props {
  mapData: FeatureCollection;
  height?: number;
  width?: number;
}
const initialScaleRef = {
  scaleX: (x: number) => x,
  scaleY: (y: number) => y,
};

export default function D3Map({ mapData, height = 300, width = 600 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<{ [key: string]: (x: number) => number }>(
    initialScaleRef
  );

  const rus = d3.geoCentroid(
    mapData.features.find((f) => f.properties?.name_en === "Russia")!!
  );

  const bra = d3.geoCentroid(
    mapData.features.find((f) => f.properties?.name_long === "Brazil")!!
  );
  console.log(rus, bra);

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
        console.log(center);
        svg
          .append("circle")
          .attr("class", "marker")
          .attr("cx", scaleRef.current.scaleX(center[0]))
          .attr("cy", scaleRef.current.scaleY(center[1]))
          .attr("r", 5)
          .attr("fill", "none")
          .attr("stroke", "black")
          .classed("ac", true);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#69b3a2");
        d3.selectAll(".ac").remove();
      });

    const text = svg
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
        return d.properties?.sido_nm;
      });

    const geoInterpolator = d3.geoInterpolate(
      bra as [number, number],
      rus as [number, number]
    );

    const interpolatedPoints = d3
      .range(0, 1.1, 0.05)
      .map((t) => projection(geoInterpolator(t)));

    console.log(interpolatedPoints);
    const curveLine = d3
      .line()
      .curve(d3.curveCardinal.tension(1))
      .x((d) => d[0])
      .y((d) => d[1]);
    const curve = svg
      .append("path")
      .datum(interpolatedPoints)
      .attr("d", curveLine as any)
      .attr("fill", "none")
      .attr("stroke", "red");

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
      map.attr("transform", e.transform.toString());
      text.attr("transform", function (d) {
        const [x, y] = geoGenerator.centroid(d);
        return `translate(${scaleX(x)},${scaleY(y)})`;
      });
      curve.attr("transform", e.transform.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  return <div ref={ref}>D3Map</div>;
}
