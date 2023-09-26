"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useRecoilState } from "recoil";
import { LivingSliderPoint } from "@/context/atom";
import { PiMinusSquareLight, PiPlusSquareLight } from "react-icons/pi";

interface Props {
  data?: any;
  height?: number;
  width?: number;
}

export default function D3Slider({ data, height = 40, width = 200 }: Props) {
  const [sliderPoint, setSliderPoint] = useRecoilState(LivingSliderPoint);
  const ref = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<d3.ScaleLinear<number, number, never>>();

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg1 = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + 20)
      .attr("height", height);
    // .style('border', '1px solid steelblue')
    const svg = svg1
      .append("svg")
      .append("g")
      .attr("width", width)
      .attr("height", height - 20)
      .attr("transform", "translate(10,5)");
    // .style('border', '1px solid red')

    const xScale = d3.scaleLinear([10, 100], [0, width]);
    scaleRef.current = xScale;

    const xAxis = d3.axisBottom(xScale);

    const xAxisG = svg
      .append("g")
      .attr("transform", "translate(0,7)")
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
      .attr("width", xScale(sliderPoint))
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
      .selectAll(".dataCircle")
      .data([sliderPoint])
      .enter()
      .append("circle")
      .attr("class", "dataCircle")
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
      const quantizeScale = d3
        .scaleQuantize()
        .domain([0, width])
        .range(d3.range(10, 101, 1));
      const quantizedValue = quantizeScale(e.x);

      const newX = xScale(quantizedValue);
      d3.select(this).attr("cx", newX);
      svg.select(".dataBar").attr("width", newX);
      setSliderPoint(xScale.invert(newX));
    }
    circle.call(drag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (type: string) => {
    if (!scaleRef.current) return;
    if (type === "minus" && sliderPoint > 10) {
      if (sliderPoint % 10 === 0) {
        const newPoint = scaleRef.current(sliderPoint - 10);
        d3.select(".dataCircle").attr("cx", newPoint);
        d3.select(".dataBar").attr("width", newPoint);
        setSliderPoint(sliderPoint - 10);
      } else {
        const newPoint = scaleRef.current(sliderPoint - (sliderPoint % 10));
        d3.select(".dataCircle").attr("cx", newPoint);
        d3.select(".dataBar").attr("width", newPoint);
        setSliderPoint(sliderPoint - (sliderPoint % 10));
      }
    } else if (type === "plus" && sliderPoint < 100) {
      if (sliderPoint % 10 === 0) {
        const newPoint = scaleRef.current(sliderPoint + 10);
        d3.select(".dataCircle").attr("cx", newPoint);
        d3.select(".dataBar").attr("width", newPoint);
        setSliderPoint(sliderPoint + 10);
      } else {
        const newPoint = scaleRef.current(
          sliderPoint + (10 - (sliderPoint % 10))
        );
        d3.select(".dataCircle").attr("cx", newPoint);
        d3.select(".dataBar").attr("width", newPoint);
        setSliderPoint(sliderPoint + (10 - (sliderPoint % 10)));
      }
    }
  };
  return (
    <div className="flex text-2xl">
      <PiMinusSquareLight
        id="minus"
        className="cursor-pointer"
        onClick={() => handleClick("minus")}
      />

      <div ref={ref}></div>
      <PiPlusSquareLight
        className="cursor-pointer"
        onClick={() => handleClick("plus")}
      />
    </div>
  );
}
