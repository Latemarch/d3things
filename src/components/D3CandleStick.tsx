"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data?: any;
  width?: number;
  height?: number;
}

export default function D3CnadleStick({
  data,
  width = 1000,
  height = 500,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    d3.select(ref.current).selectAll("svg").remove();

    const container = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + 120)
      .attr("height", height + 100)
      // .attr('viewBox', `0 0 ${width + 80} ${height + 80}`)
      .style("border", "1px solid steelblue");
    const clip = container
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const svg = container.append("g").attr("transform", `translate(50,40)`);

    const [min, max] = getPriceRange(data);
    const x = d3.scaleLinear([0, 1440], [0, width]);
    const y = d3.scaleLinear([min - 50, max + 50], [height, 0]);
    console.log(min, max);
    console.log(data.length);

    const xAxis = d3.axisBottom(x);
    const xAxisG = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    const yAxis = svg.append("g").call(d3.axisLeft(y));

    const bars = svg
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("rect")
      .data(data as number[][])
      .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", (d) => y(d[1] > d[4] ? d[1] : d[4]))
      .attr("width", x(width / 1440))
      .attr("fill", (d) => (d[1] > d[4] ? "#ED4549" : "#8BC53F"))
      .attr("height", (d) => (d[4] === d[1] ? 1 : Math.abs(y(d[4]) - y(d[1]))));

    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([1, 20])
      .translateExtent([
        [-50, 0],
        [width + 50, height],
      ]);

    container
      .call(zoom as any)
      .call(
        zoom.transform as any,
        d3.zoomIdentity.translate(-width * 9, 0).scale(10)
      );
    function handleZoom(e: d3.D3ZoomEvent<SVGGElement, unknown>) {
      const newScaleX = e.transform.rescaleX(x);
      xAxisG.call(xAxis.scale(newScaleX));
      const minX = newScaleX.invert(0);
      const maxX = newScaleX.invert(width);
      const [min, max] = getPriceRange(data.slice(minX, maxX));
      const newScaleY = d3.scaleLinear([min - 50, max + 50], [height, 0]);
      bars
        .attr("x", (d, i) => newScaleX(i))
        .attr("y", (d) => newScaleY(d[1] > d[4] ? d[1] : d[4])) // this part
        .attr("width", width / (maxX - minX))
        .attr("height", (d) =>
          d[4] === d[1] ? 1 : Math.abs(newScaleY(d[4]) - newScaleY(d[1]))
        );
      yAxis.call(d3.axisLeft(y).scale(newScaleY));
      console.log(min, max);
    }
  }, []);

  return <div ref={ref} className="p-10"></div>;
}

function getPriceRange(data: Array<Array<number>>): [number, number] {
  const minPrice = data.reduce(
    (min: number, candle: Array<number>) => Math.min(min, candle[3]),
    Infinity
  );
  const maxPrice = data.reduce(
    (max: number, candle: Array<number>) => Math.max(max, candle[2]),
    -Infinity
  );
  return [minPrice, maxPrice];
}
