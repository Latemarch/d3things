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
    const x = d3.scaleUtc([data[0][0], data[data.length - 1][0]], [0, width]);
    const T = x.ticks();
    const f = x.tickFormat();
    T.map(f);

    const y = d3.scaleLinear([min - 50, max + 50], [height, 0]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    const yAxis = svg.append("g").call(d3.axisLeft(y));

    const bars = svg
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("rect")
      .data(data as number[][])
      .join("rect")
      .attr("x", (d, i) => x(d[0]))
      .attr("y", (d) => y(d[1] > d[4] ? d[1] : d[4]))
      // .attr("width", x(data[0][0] + 60))
      .attr("width", width / data.length)
      .attr("fill", (d) => (d[1] > d[4] ? "#ED4549" : "#8BC53F"))
      .attr("height", (d) => (d[4] === d[1] ? 1 : Math.abs(y(d[4]) - y(d[1]))));

    const lines = svg
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("line")
      .data(data as number[][])
      .join("line")
      .attr("stroke", (d) => (d[1] > d[4] ? "#ED4549" : "#8BC53F"))
      .attr("x1", (d, i) => x(i + 0.5))
      .attr("x2", (d, i) => x(i + 0.5))
      .attr("y1", (d) => y(d[2]))
      .attr("y2", (d) => y(d[3]))
      .attr("stroke-width", 1);

    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([1.2, 20])
      .translateExtent([
        [0, 0],
        [width + 120, height],
      ]);

    container
      .call(zoom as any)
      .call(
        zoom.transform as any,
        d3.zoomIdentity.translate(-width * 9, 0).scale(10)
      );
    function handleZoom(e: d3.D3ZoomEvent<SVGGElement, unknown>) {
      const newScaleX = e.transform.rescaleX(x);
      const sX = e.transform.rescaleX(
        d3.scaleLinear([0, data.length], [0, width])
      );
      const minX = sX.invert(0);
      const maxX = sX.invert(width);
      const [min, max] = getPriceRange(data.slice(minX, maxX));
      const newScaleY = d3.scaleLinear([min - 50, max + 50], [height, 0]);
      bars
        .attr("x", (d, i) => sX(i))
        .attr("y", (d) => newScaleY(d[1] > d[4] ? d[1] : d[4])) // this part
        .attr("width", width / (maxX - minX))
        .attr("height", (d) =>
          d[4] === d[1] ? 1 : Math.abs(newScaleY(d[4]) - newScaleY(d[1]))
        );
      lines
        .attr("x1", (d, i) => sX(i + 0.5))
        .attr("x2", (d, i) => sX(i + 0.5))
        .attr("y1", (d) => newScaleY(d[2])) // d[0] is just an example, adjust the index
        .attr("y2", (d) => newScaleY(d[3])); // d[3] is just an example, adjust the index

      xAxis.call(d3.axisBottom(x).scale(newScaleX));
      yAxis.call(d3.axisLeft(y).scale(newScaleY));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
