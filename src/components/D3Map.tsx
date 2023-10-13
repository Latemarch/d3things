/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";
import { addFlow } from "@/service/D3CustomFtns";

interface Props {
  mapData: FeatureCollection;
  height?: number;
  width?: number;
}
const initialScaleRef = {
  scaleX: (x: number) => x,
  scaleY: (y: number) => y,
};

export default function D3Map({ mapData }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setContainerWidth] = useState<number>(1200);
  const [height, setContainerHeight] = useState<number>(1200);
  const ref = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<{ [key: string]: (x: number) => number }>(
    initialScaleRef
  );

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
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();
    const zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([1, 20])
      .translateExtent([
        [0, 0],
        [width, height],
      ]);
    const svg = d3.select(ref.current).append("svg");
    svg //
      .attr("viewBox", `0 0 ${width} ${height}`)
      .call(zoom as any)
      .classed("bg-[#212121]", true)
      .attr("transform", "translate(-200,0)")
      .append("g");

    const projection = d3.geoMercator().fitExtent(
      [
        [0, 30],
        [width, height - 200],
      ],
      mapData
    );

    const geoGenerator = d3.geoPath().projection(projection);

    const map = svg
      .selectAll("path")
      .append("g")
      .attr("class", "map1")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("d", geoGenerator)
      .attr("fill", "#0e0e0e")
      .attr("stroke", "#545454")
      .attr("stroke-width", 0.2)
      .attr("data-id", (d: Feature) => d.properties?.id)
      .on("mouseover", function (e, d) {
        // d3.select(this).attr("fill", "#63ABFF");
      })
      .on("mouseleave", function () {
        // d3.select(this).attr("fill", "steelblue");
      });

    const text = svg
      .selectAll(".place-label")
      .data(mapData.features)
      .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", function (d) {
        return "translate(" + geoGenerator.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .text(function (d) {
        return d.properties?.sido_nm;
      });

    dummyFlow.forEach((el, i) => {
      addFlow({
        sourcePointId: el.id,
        targetPointId: 21,
        projection,
        svg,
        mapData,
        idx: i,
      });
    });

    function handleZoom(e: d3.D3ZoomEvent<SVGElement, unknown>) {
      const scaleX = (x: number) => e.transform.applyX(x);
      const scaleY = (y: number) => e.transform.applyY(y);
      scaleRef.current = { scaleX, scaleY };
      map.attr("transform", e.transform.toString());
      text.attr("transform", function (d) {
        const [x, y] = geoGenerator.centroid(d);
        return `translate(${scaleX(x)},${scaleY(y)})`;
      });
      svg.selectAll(".flowLine").attr("transform", e.transform.toString());
      // svg.selectAll("circle").attr("transform", e.transform.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, width]);

  return (
    <div ref={containerRef} className="flex w-full h-full justify-center ">
      <div ref={ref} className="fixed w-full"></div>
    </div>
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
