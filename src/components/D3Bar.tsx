"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Margin = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};
interface Props {
  data: number[];
  height: number;
  width: number;
  margin?: Margin;
}
const initialMargin = { top: 20, bottom: 20, left: 20, right: 20 };

export default function D3Bar({
  data,
  height,
  width,
  margin = initialMargin,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear([1997, 2050], [0, width]);
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(Array.from({ length: 7 }, (_, i) => 1980 + i * 10));

    // x-axis
    const xAxisG = svg
      .append("g")
      .attr("transform", `translate(0,${50})`)
      .attr("class", "x-axis")
      .call(xAxis);

    xAxisG.selectAll("line").style("stroke", "none");
    xAxisG.select("path").style("stroke", "none");

    //bar
    const bars = svg
      .selectAll("bar")
      .data([2050, 2023])
      .enter()
      .append("rect")
      .attr("y", 30)
      .attr("width", (d) => xScale(d))
      .attr("height", 20)
      .attr("fill", (d) => (d > 2023 ? "#63ABFF" : "#D9D9D9"));

    //border line in every 10 year
    const borders = svg
      .selectAll("border")
      .data(Array.from({ length: 7 }, (_, i) => 1980 + i * 10))
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d))
      .attr("y", 30)
      .attr("width", 1)
      .attr("height", 20)
      .attr("fill", "white");

    const zoom = d3.zoom();
  }, []);

  return <div ref={ref} className="font-bold"></div>;
}
