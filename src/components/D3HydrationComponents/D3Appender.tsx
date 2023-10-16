/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
export default function D3Appender() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setContainerWidth] = useState<number>(2000);
  const [height, setContainerHeight] = useState<number>(800);
  console.log("useEffect?");
  useEffect(() => {
    // 이 함수는 window 크기가 변경될 때마다 실행됩니다.(to get container width and set recoil state)
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
        setContainerHeight(containerRef.current.getBoundingClientRect().height);
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const svg = d3.select(".d3Map");
    svg.attr("viewBox", `0 0 ${width} ${height - 68}`);
    console.log(width, height);
  }, [width, height]);
  useEffect(() => {
    setTimeout(() => {
      console.log("appending");
      const svg = d3.select(".d3Map");
      function handleZoom(e: d3.D3ZoomEvent<SVGElement, unknown>) {
        svg.selectAll("path").attr("transform", e.transform.toString());
        // svg.selectAll(".flowLine").attr("transform", e.transform.toString());
        // svg.selectAll("circle").attr("transform", e.transform.toString());
      }
      const zoom = d3
        .zoom()
        .on("zoom", handleZoom)
        .scaleExtent([1, 20])
        .translateExtent([
          [0, 0],
          [width, height],
        ]);
      svg.call(zoom as any).classed("bg-[#212121]", true);
      // svg.attr("viewBox", `0 0 ${width} ${height}`);
      // svg
      //   .selectAll("rect")
      //   // .append("rect")
      //   .attr("class", "here")
      //   .attr("width", 200)
      //   .attr("height", 200)
      //   .attr("transform", `translate(100,100)`);
    }, 100);
  }, []);
  return (
    <div ref={containerRef} className="flex w-full h-screen z-10 fixed "></div>
  );
}

const dummyFlow = [
  { id: 42, flow: 10000 },
  { id: 38, flow: 20000 },
  { id: 24, flow: 30000 },
  { id: 25, flow: 40000 },
  { id: 26, flow: 50000 },
  { id: 37, flow: 60000 },
  { id: 28, flow: 70000 },
  { id: 19, flow: 90000 },
  { id: 10, flow: 100000 },
  { id: 11, flow: 110000 },
  { id: 32, flow: 120000 },
  { id: 23, flow: 130000 },
  { id: 34, flow: 140000 },
  { id: 35, flow: 150000 },
  { id: 26, flow: 160000 },
  { id: 27, flow: 160000 },
];

function getRandomPoint(point: any, polygon: any, projection: any) {
  let attempts = 10;
  const length = d3.geoLength(polygon);
  const scale = (length * projection.scale()) / 5;
  const circle = createCirclePolygon(point, length);
  while (attempts > 0) {
    const newPoint = [
      point[0] + (Math.random() - 0.5) * scale,
      point[1] + (Math.random() - 0.5) * scale,
    ] as [number, number];
    if (d3.geoContains(circle, projection.invert(newPoint))) return newPoint;
    attempts--;
  }
  return [
    point[0] + (Math.random() - 0.5) * scale,
    point[1] + (Math.random() - 0.5) * scale,
  ] as [number, number];
}

function createCirclePolygon(
  center: any,
  radius: any,
  numPoints = 20
): d3.GeoGeometryObjects {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const x = center[0] + radius * Math.cos(angle) * 0.8;
    const y = center[1] + radius * Math.sin(angle) * 0.8;
    points.push([x, y]);
  }
  points.push(points[0]); // 원을 닫기 위해 첫 번째 점을 다시 추가

  return {
    type: "Polygon",
    coordinates: [points],
  };
}
