"use client";

import * as d3 from "d3";
import { useEffect } from "react";

export default function HydratingMap() {
  useEffect(() => {
    const svg = d3.select(".topoMap");
    const paths = svg.selectAll(".flowLine");
    addPathAnimation(paths);
    function handleZoom(e: d3.D3ZoomEvent<SVGElement, unknown>) {
      svg.selectAll("path").attr("transform", e.transform.toString());
    }
    const zoom = d3.zoom().on("zoom", handleZoom).scaleExtent([0.5, 2]);
    svg.call(zoom as any);
  }, []);
  return <div></div>;
}

function addPathAnimation(paths: any) {
  paths.each(function (_: any, i: number) {
    //@ts-ignore
    const singlePath = d3.select(this);
    const totalLength = singlePath.node()!.getTotalLength();

    singlePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .delay((i % 20) * 500)
      .duration(12000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", -totalLength)
      .on("end", function repeat() {
        d3.select(this)
          .transition()
          .duration(0)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(12000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", -totalLength)
          .on("end", repeat);
      });
  });
}
