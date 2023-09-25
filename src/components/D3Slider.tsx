"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useRecoilState } from "recoil";
import { LivingSliderPoint } from "@/context/atom";

interface Props {
  data?: any;
  height?: number;
  width?: number;
}

export default function D3Slider({ data, height = 30, width = 200 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [sliderPoint, setSliderPoint] = useRecoilState(LivingSliderPoint);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg1 = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + 20)
      .attr("height", height)
      .style("border", "1px solid steelblue");
    const svg = svg1
      .append("svg")
      .append("g")
      .attr("width", width)
      .attr("height", height - 20)
      .attr("transform", "translate(10,5)")
      .style("border", "1px solid red");

    const xScale = d3.scaleLinear([10, 100], [0, width]);

    const xAxis = d3.axisBottom(xScale);

    const xAxisG = svg
      .append("g")
      // .attr("transform", "translate(0,20)")
      .call(xAxis);

    xAxisG.selectAll("line").style("stroke", "none");
    xAxisG.selectAll("path").style("stroke", "none");

    svg
      .append("rect")
      .attr("width", xScale(100))
      .attr("height", 5)
      .attr("fill", "#d9d9d9");

    const bar = svg
      .append("rect")
      .attr("class", "dataBar")
      .attr("width", xScale(20))
      .attr("height", 5)
      .attr("fill", "#1C72BF");

    const initialCircle = svg
      .selectAll(".boundaryCircle")
      .data([10, 100])
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d))
      .attr("cy", 2.5)
      .attr("r", 2.5)
      .attr("fill", (d) => (d < 100 ? "#1C72BF" : "#d9d9d9"));

    const circle = svg
      .selectAll(".datacircle")
      .data([20])
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d))
      .attr("cy", 2.5)
      .attr("r", 5)
      .attr("stroke", "white")
      .attr("fill", "#6FADE4");

    const drag = d3
      .drag<SVGCircleElement, number, number>()
      .on("drag", dragging);
    function dragging(
      this: SVGGElement,
      e: d3.D3DragEvent<SVGGElement, number, number>
    ) {
      const maxX = Math.max(0, Math.min(width, e.x));
      const newX = Math.min(maxX, width - 0);

      // d3.select(this).attr("transform", `translate(${xScale(newX)},2.5)`);
      d3.select(this).attr("cx", newX);
      svg.select(".dataBar").attr("width", newX);
      console.log(newX, xScale(newX));
      setSliderPoint(xScale.invert(newX));
    }
    circle.call(drag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex ">
      <div>a</div>
      <div ref={ref}></div>
      <div>b</div>
      {sliderPoint}
    </div>
  );
}
