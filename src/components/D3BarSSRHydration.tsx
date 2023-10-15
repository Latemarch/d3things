"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
type Props = {
  width: number;
  data?: any;
};

export default function D3BarSSRHydration({ data, width }: Props) {
  const newScaleRef = useRef<d3.ScaleLinear<number, number>>();
  const handlePositionRef = useRef<number>(0);
  useEffect(() => {
    const svg = d3.select<SVGSVGElement, unknown>(".d3BarSSR"); // Explicitly define the type for the selection
    const xScale = d3.scaleLinear([1970, 2050], [0, width]);
    const x = d3
      .axisBottom(xScale)
      .tickValues(Array.from({ length: 7 }, (_, i) => 1980 + i * 10));
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${50})`)
      .attr("class", "x-axis")
      .call(x);
    xAxis.selectAll("line").style("stroke", "none");
    xAxis.select("path").style("stroke", "none");

    const mark = svg.selectAll(".mark");
    console.log(mark);
    const drag = d3.drag<SVGGElement, number, number>().on("drag", dragging);

    function dragging(
      this: SVGGElement,
      e: d3.D3DragEvent<SVGGElement, number, number>
    ) {
      const nX = Math.max(2, Math.min(width, e.x));
      const newX = Math.min(nX, width - 3);
      d3.select(this).attr("transform", `translate(${newX - 5},10)`);
    }
    svg.select<SVGGElement>(".ssrHandle").call(drag as any);

    function handleZoom(e: d3.D3ZoomEvent<SVGGElement, unknown>) {
      const newScale = e.transform.rescaleX(xScale);
      const duration = 50;
      newScaleRef.current = newScale;

      xAxis
        .transition()
        .duration(duration)
        .call(x.scale(newScale) as any);

      svg
        .selectAll(".mark")
        .data(data)
        .transition()
        .duration(duration)
        .attr("transform", (d: any) => `translate(${newScale(d.year)}, 40)`);
      // .attr("x", (d: any) => newScale(d));
      // handle
      //   .transition()
      //   .duration(duration)
      //   .attr(
      //     "transform",
      //     `translate(${
      //       newScale(
      //         handlePositionRef.current ? handlePositionRef.current : 2023
      //         // handlePosition
      //       ) - 5
      //     }, 10)`
      //   );

      // marks
      //   .transition()
      //   .duration(duration)
      //   .attr("transform", (d: any) => `translate(${newScale(d.year)}, 40)`);
      // svg
      //   .selectAll(".bars")
      //   .transition()
      //   .duration(duration)
      //   .attr("width", (d: any) => newScale(d));
    }

    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [width, 90],
      ]);
    svg
      .call(zoom as any)
      .call(
        zoom.transform as any,
        d3.zoomIdentity.translate(-(width * 0.481), 0).scale(1.481)
      );
  }, []);
  return <div></div>;
}
