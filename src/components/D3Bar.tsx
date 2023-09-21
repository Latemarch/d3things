"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Props {
  data: number[];
}

const width = 500;
const height = 100;
export default function D3Bar({ data }: Props) {
  const [handlePosition, setHandlePosition] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const newScaleRef = useRef<d3.ScaleLinear<number, number>>();
  const handlePositionRef = useRef<number>(0);
  const handleXRef = useRef<number>(0);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // .attr("viewBox", `0 0 1000 100`);

    const xScale = d3.scaleLinear([1970, 2050], [0, width]);

    // x-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(Array.from({ length: 7 }, (_, i) => 1980 + i * 10));
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
      .attr("transform", "translate(-0.5,0)")
      .attr("fill", "white");

    //markers
    const symbolGenerator = d3.symbol().type(d3.symbolDiamond).size(100);
    const marks = svg
      .selectAll("mark")
      .data([2020, 2030])
      .enter()
      .append("path")
      .attr("transform", (d) => `translate(${xScale(d)}, 40)`)
      .attr("d", symbolGenerator)
      .attr("fill", "white");

    //Draggable handle
    const drag = d3.drag<SVGGElement, number, number>().on("drag", dragging);

    function dragging(
      this: SVGGElement,
      e: d3.D3DragEvent<SVGGElement, number, number>
    ) {
      const nX = Math.max(-5, Math.min(width, e.x));
      const newX = Math.min(nX, width - 5);

      // d3.select(this).attr("x", newX);
      d3.select(this).attr("transform", `translate(${newX},10)`);

      if (!newScaleRef.current) return;
      const year = Math.round(newScaleRef.current.invert(newX));
      handlePositionRef.current = year;
      setHandlePosition(year);
    }

    const handle = svg
      .selectAll(".handle")
      .data([2023])
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${xScale(d)},10 )`)
      .call(drag); // Apply the drag behavior to the group

    // Append the first rectangle to the handle
    handle
      .append("rect")
      .attr("x", 4)
      .attr("y", 10)
      .attr("width", 3)
      .attr("height", 65)
      .attr("rx", 1.5)
      .attr("fill", "#585858");

    // Append the second rectangle to the handle
    handle
      .append("rect")
      .attr("y", 61)
      .attr("width", 11)
      .attr("height", 9)
      .attr("rx", 2)
      .attr("fill", "#D9D9D9");

    // Append the paths to the handle
    const pathsData = ["M3 63V68.5", "M5.5 63V68.5", "M8 63V68.5"];

    handle
      .selectAll("path")
      .data(pathsData)
      .enter()
      .append("path")
      .attr("d", (d) => d)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("stroke-linecap", "round");

    //zoom
    function handleZoom(e: any) {
      const newScale = e.transform.rescaleX(xScale);
      newScaleRef.current = newScale;
      xAxisG.call(xAxis.scale(newScale));
      borders.attr("x", (d) => newScale(d));
      handle.attr(
        "transform",
        `translate(${newScale(
          handlePositionRef.current ? handlePositionRef.current : 2023
        )}, 10)`
      );
      marks.attr("transform", (d) => `translate(${newScale(d)}, 40)`);
      bars.attr("width", (d) => newScale(d));
    }

    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [width, height],
      ]);

    svg
      .call(zoom as any)
      .call(
        zoom.transform as any,
        d3.zoomIdentity.translate(-(width * 0.481), 0).scale(1.481)
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="font-bold w-full relative">
      <div>{handlePosition}</div>
    </div>
  );
}
