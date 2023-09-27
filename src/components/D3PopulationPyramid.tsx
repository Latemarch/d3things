"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data?: any;
  height?: number;
  width?: number;
}

export default function D3PopulationPyramid({
  data,
  height = 250,
  width = 500,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width + 80} ${height + 80}`)
      .style("border", "1px solid steelblue")
      .append("g")
      .attr("transform", `translate(40,20)`);

    const x = d3.scaleLinear(
      [
        d3.min(dummyData, (d) => d.male) ?? 0,
        d3.max(dummyData, (d) => d.female) ?? 0,
      ],
      [0, width]
    );

    const ageGroups = dummyData.map((d) => d.ageGroup);
    const y = d3.scaleBand(ageGroups, [height, 0]);
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    xAxis.selectAll("path").attr("stroke", "none");
    xAxis.selectAll("line").attr("stroke", "none");

    const pathM = svg
      .append("g")
      .selectAll("pathM")
      .data(dummyData)
      .join("path")
      .attr("d", (d) =>
        roundedRectM(
          x(d.male),
          y(d.ageGroup) ?? 0,
          width / 2 - x(d.male),
          10,
          5
        )
      )
      .attr("fill", "#63ABFF");

    const pathF = svg
      .append("g")
      .selectAll("pathF")
      .data(dummyData)
      .join("path")
      .attr("d", (d) =>
        roundedRectF(
          width / 2,
          y(d.ageGroup) ?? 0,
          x(d.female) - width / 2,
          10,
          5
        )
      )
      .attr("fill", "#eb5853");
    const label = svg
      .append("g")
      .attr("transform", `translate(${width - 80},10)`);
    label
      .append("rect")
      .attr("height", 8)
      .attr("width", 8)
      .attr("rx", 2)
      .attr("fill", "#63abff");
    label
      .append("rect")
      .attr("height", 8)
      .attr("width", 8)
      .attr("rx", 3)
      .attr("x", 40)
      .attr("fill", "#eb5853");
    label
      .append("text")
      .text("남성")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("x", 12)
      .attr("y", 8);
    label
      .append("text")
      .text("여성")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("x", 52)
      .attr("y", 8);
  }, []);

  return <div ref={ref}>D3PopulationPyramid</div>;
}

const dummyData = [
  { ageGroup: "0-4", male: -4000, female: 3900 },
  { ageGroup: "5-9", male: -4200, female: 4100 },
  { ageGroup: "10-14", male: -4400, female: 4300 },
  { ageGroup: "15-19", male: -4600, female: 4500 },
  { ageGroup: "20-24", male: -4200, female: 4000 },
  { ageGroup: "25-29", male: -3800, female: 3700 },
  { ageGroup: "30-34", male: -3600, female: 3500 },
  { ageGroup: "35-39", male: -3400, female: 3300 },
  { ageGroup: "40-44", male: -3200, female: 3100 },
  { ageGroup: "45-49", male: -3000, female: 2900 },
  { ageGroup: "50-54", male: -2800, female: 2700 },
  { ageGroup: "55-59", male: -2600, female: 2500 },
  { ageGroup: "60-64", male: -2400, female: 2300 },
  { ageGroup: "65-69", male: -2200, female: 2100 },
  { ageGroup: "70-74", male: -2000, female: 1900 },
  { ageGroup: "75-79", male: -1800, female: 1700 },
  { ageGroup: "80-84", male: -1400, female: 1300 },
  { ageGroup: "85+", male: -1000, female: 1100 },
];

function roundedRectM(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  return `
  M${x + radius},${y} 
  H${x + width}
  V${y + height}
  H${x + radius}
  Q${x},${y + height} ${x},${y + height - radius}
  V${y + radius}
  Q${x},${y} ${x + radius},${y} 
  `;
}

function roundedRectF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  return `
      M${x},${y}
      H${x + width - radius}
      Q${x + width},${y} ${x + width},${y + radius}
      V${y + height - radius}
      Q${x + width},${y + height} ${x + width - radius},${y + height}
      H${x}
      V${y}
  `;
}
