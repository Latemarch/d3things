"use client";

import { useEffect, useRef, useState } from "react";
import { BsFastForward, BsPause, BsPlay } from "react-icons/bs";
import * as d3 from "d3";

interface Props {
  data: number[];
}

const eventData = [
  {
    name: "인구4000",
    year: 2000,
  },
  { name: "인구3000", year: 2010 },
  { name: "인구2000", year: 2015 },
  { name: "인구1000", year: 2020 },
];
const width = 1000;
const height = 90;
const handleCenter = -5;
export default function D3Bar({ data }: Props) {
  const [handlePosition, setHandlePosition] = useState(2023);
  const ref = useRef<HTMLDivElement | null>(null);
  const newScaleRef = useRef<d3.ScaleLinear<number, number>>();
  const handlePositionRef = useRef<number>(0);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      // .attr("width", width)
      // .attr("height", height);

      .attr("viewBox", `0 0 1000 100`);

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
      .attr("fill", (d) => (d > 2024 ? "#63ABFF" : "#D9D9D9"));

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
    const marks = svg //
      .selectAll("mark")
      .data(eventData)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${xScale(d.year)}, 40)`);
    // .append("path")
    // .attr("d", symbolGenerator)
    // .attr("fill", "white");
    const icons = marks
      .append("path")
      .attr("d", symbolGenerator)
      .attr("fill", "white");

    const tooltip = d3
      .select("body")
      .append("div")
      .classed("speech-bubble text-sm", true)
      .style("display", "none"); // Initially hidden

    marks.on("mousemove", function (event, d) {
      // Get mouse position
      // Show and position the tooltip
      if (!newScaleRef.current) return;
      tooltip
        .style("left", `${newScaleRef.current(d.year) + 8}px`)
        .style("top", "50px")
        .style("display", "block")
        .html(`<p>${d.name}</p>`);
    });

    marks.on("mouseleave", function () {
      // Hide the tooltip
      tooltip.style("display", "none");
    });

    // marks.on("mousemove", function (e, d) {
    //   d3.select(this);
    // });

    // marks.on("mouseleave", function (e) {
    //   d3.select(this).attr("fill", "white");
    // });

    //Draggable handle
    const drag = d3.drag<SVGGElement, number, number>().on("drag", dragging);

    function dragging(
      this: SVGGElement,
      e: d3.D3DragEvent<SVGGElement, number, number>
    ) {
      const nX = Math.max(2, Math.min(width, e.x));
      const newX = Math.min(nX, width - 3);

      // d3.select(this).attr("x", newX);
      d3.select(this).attr("transform", `translate(${newX + handleCenter},10)`);

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
      .attr("transform", (d) => `translate(${xScale(d) - 5},10 )`)
      .call(drag);

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
      const duration = 50;
      newScaleRef.current = newScale;

      xAxisG.transition().duration(duration).call(xAxis.scale(newScale));

      borders
        .transition()
        .duration(duration)
        .attr("x", (d) => newScale(d));
      handle
        .transition()
        .duration(duration)
        .attr(
          "transform",
          `translate(${
            newScale(
              handlePositionRef.current ? handlePositionRef.current : 2023
              // handlePosition
            ) + handleCenter
          }, 10)`
        );

      marks
        .transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${newScale(d.year)}, 40)`);
      bars
        .transition()
        .duration(duration)
        .attr("width", (d) => newScale(d));
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
    document
      .getElementById("pause")
      ?.addEventListener("click", function (e: MouseEvent) {
        console.log("pause");
        d3.interrupt(handle.node());
      });
    document
      .getElementById("btns")
      ?.addEventListener("click", function (e: MouseEvent) {
        const targetElement = e.target as HTMLElement;
        handle
          .transition()
          .ease(d3.easeLinear)
          .duration(20000 / (targetElement.id ? parseInt(targetElement.id) : 1))
          .attrTween("transform", function (d) {
            const interpolate = d3.interpolate(0, width - 10);
            return function (t) {
              const newX = interpolate(t);

              if (newScaleRef.current) {
                const year = Math.round(newScaleRef?.current?.invert(newX));
                setHandlePosition(year);
              }
              return `translate(${newX},10)`;
            };
          });
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col bg-gray-300 items-end">
      <div className="flex gap-2">
        <BsPause id="pause" />
        <div id="btns" className="flex gap-2">
          <BsPlay id="1" />
          <BsFastForward id="2" />
          <div className="flex relative px-1">
            <BsPlay id="3" className="absolute" />
            <BsFastForward id="3" />
          </div>
        </div>
      </div>
      <div ref={ref} className="font-bold w-full relative"></div>
      <div>{handlePosition}</div>
    </div>
  );
}
