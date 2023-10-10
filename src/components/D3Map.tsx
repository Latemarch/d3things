"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";

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

  const rus = d3.geoCentroid(
    mapData.features.find((f) => f.properties?.id === 1)!!
  );

  const bra = d3.geoCentroid(
    mapData.features.find((f) => f.properties?.id === 2)!!
  );
  console.log(mapData);

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
      // .classed("bg-gray-300", true)
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
      .attr("fill", "black")
      .attr("stroke", "black")
      .attr("data-id", (d: Feature) => d.properties?.id)
      .on("mouseover", function (e, d) {
        // d3.select(this).attr("fill", "#63ABFF");
        const center = geoGenerator.centroid(d);
        console.log(center);
        // svg
        //   .append("circle")
        //   .attr("class", "marker")
        //   .attr("cx", scaleRef.current.scaleX(center[0]))
        //   .attr("cy", scaleRef.current.scaleY(center[1]))
        //   .attr("r", 5)
        //   .attr("fill", "none")
        //   .attr("stroke", "black")
        //   .classed("ac", true);
      })
      .on("mouseleave", function () {
        // d3.select(this).attr("fill", "#69b3a2");
        // d3.selectAll(".ac").remove();
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

    // const geoInterpolator = d3.geoInterpolate(
    //   bra as [number, number],
    //   rus as [number, number]
    // );

    // const interpolatedPoints = d3
    //   .range(0, 1, 0.05)
    //   .map((t) => projection(geoInterpolator(t)));

    // const curveLine = d3
    //   .line()
    //   .curve(d3.curveBasis) //.tension(-1))
    //   .x((d) => d[0])
    //   .y((d) => d[1]);
    // const curve = svg
    //   .append("path")
    //   .datum(interpolatedPoints)
    //   .attr("d", curveLine as any)
    //   .attr("fill", "none")
    //   .attr("stroke", "red");

    dummyFlow.forEach((el) => {
      addFlow({
        startPointId: 1,
        endPointId: el.id,
        projection,
        svg,
        mapData,
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
      // curve.attr("transform", e.transform.toString());
      svg.selectAll(".flowLine").attr("transform", e.transform.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    console.log(height);
  }, [height, width]);

  return (
    <div ref={containerRef} className="flex w-full h-full justify-center ">
      <div ref={ref} className="fixed w-full"></div>
    </div>
  );
}

const dummyFlow = [
  { id: 2, flow: 10000 },
  { id: 3, flow: 20000 },
  { id: 4, flow: 30000 },
  { id: 5, flow: 40000 },
  { id: 6, flow: 50000 },
  { id: 7, flow: 60000 },
  // { id: 8, flow: 70000 },
  { id: 9, flow: 90000 },
  // { id: 10, flow: 100000 },
  { id: 11, flow: 110000 },
  // { id: 12, flow: 120000 },
  { id: 13, flow: 130000 },
  { id: 14, flow: 140000 },
  { id: 15, flow: 150000 },
  { id: 16, flow: 160000 },
  { id: 17, flow: 160000 },
];

type AddFlowLine = {
  startPointId: number;
  endPointId: number;
  projection: d3.GeoProjection;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  mapData: FeatureCollection;
};
function addFlow({
  startPointId,
  endPointId,
  projection,
  svg,
  mapData,
}: AddFlowLine) {
  const startPoint = d3.geoCentroid(
    mapData.features.find((f) => f.properties?.id === startPointId)!!
  );
  const endPoint = d3.geoCentroid(
    mapData.features.find((f) => f.properties?.id === endPointId)!!
  );
  const pointA = projection(startPoint);
  const pointB = projection(endPoint);
  if (!pointA || !pointB) return;
  const controlPoint = [
    (pointA[0] + pointB[0]) / 2,
    pointB[0] > pointA[0]
      ? pointA[1] - (pointB[0] - pointA[0]) / 2
      : pointA[1] + (pointB[0] - pointA[0]) / 2,
  ];

  const pathData = [
    "M",
    pointA[0],
    pointA[1],
    "Q",
    controlPoint[0],
    controlPoint[1], // 제어점
    pointB[0],
    pointB[1],
  ].join(" ");
  const color = d3.interpolateHslLong("purple", "orange")(endPointId / 20);
  svg
    .append("path")
    .attr("d", pathData)
    .attr("class", "flowLine")
    .attr("fill", "none")
    .attr("stroke", color);
  d3.select(`path[data-id='${endPointId}']`)
    .attr("fill", color)
    .attr("opacity", "0.9");
  svg.classed("bg-zinc-900", true);
}
