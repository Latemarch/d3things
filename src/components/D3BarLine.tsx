"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data?: any;
  height?: number;
  width?: number;
}

const dummyData = [50, 60, 70, 65, 50, 50, 52, 53, 60, 59, 57, 54];
const formattedData: [number, number][] = dummyData.map((d, i) => [i, d]);

const tickValues = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
export default function D3BarLine({ data, height = 100, width = 400 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width + 80} ${height + 80}`)
      .append("g")
      .attr("transform", `translate(40,20)`);

    const xScale = d3.scaleLinear([0, 11], [0, width]);
    const yScale = d3.scaleLinear([0, 70], [height, 0]); //Need data
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d, i) => tickValues[i].toString());

    const xAxisG = svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    xAxisG.selectAll("path").attr("stroke", "none");
    xAxisG.selectAll("line").attr("stroke", "none");
    xAxisG
      .selectAll("text")
      .style("font-size", "10px")
      .style("font-weight", "600");
    // const yAxis = d3.axisLeft(yScale);
    // const yAxisG = svg.append("g").call(yAxis);

    const line = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    svg
      .append("path")
      .attr(
        "d",
        d3
          .line()
          .x((d) => d[0])
          .y((d) => d[1])([
          [-40, height],
          [width + 40, height],
        ])
      )
      .attr("stroke", "#D9D9D9");
    svg
      .append("path")
      .attr("d", line(formattedData) || "")
      .attr("fill", "none")
      .attr("stroke", "#989898")
      .attr("stroke-width", 2);

    svg
      .append("g")
      .selectAll("dot")
      .data(dummyData)
      .join("circle")
      .attr("cx", (d, i) => xScale(i))
      .attr("cy", (d) => yScale(d))
      .attr("r", 3)
      .attr("fill", "white")
      .attr("stroke", "#898989")
      .attr("stroke-width", 2);

    svg
      .append("g")
      .selectAll("path")
      .data(dummyData)
      .join("path")
      .attr("d", (d, i) =>
        roundedRect(
          //x,y,width,height,radius
          xScale(i) - 10,
          yScale(d - 10),
          20,
          height - yScale(d - 10),
          5
        )
      )
      .attr("fill", "#63ABFF");

    const label = svg
      .append("g")
      .attr("transform", `translate(${width / 2 - 115}, ${height + 40})`);

    label
      .append("rect")
      .attr("height", 9)
      .attr("width", 26)
      .attr("fill", "#63abff");
    label
      .append("text")
      .text("예측 유입인구")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("x", 30)
      .attr("y", 8);
    label
      .append("text")
      .text("최근 1년 평균 유입인구")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("x", 145)
      .attr("y", 8);
    const labelLine = label.append("g").attr("transform", "translate(122,4)");
    labelLine
      .append("rect")
      .attr("height", 2)
      .attr("width", 17)
      .attr("fill", "#585858");
    labelLine
      .selectAll("edgeCircle")
      .data([0, 17])
      .join("circle")
      .attr("cx", (d) => d)
      .attr("cy", 1)
      .attr("r", 1)
      .attr("fill", "#585858");
    labelLine
      .append("circle")
      .attr("cx", 9)
      .attr("cy", 1)
      .attr("r", 2)
      .attr("fill", "white")
      .attr("stroke", "#585858");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref}></div>;
}

function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  return `
      M${x + radius},${y} 
      H${x + width - radius}
      Q${x + width},${y} ${x + width},${y + radius}
      V${y + height} 
      H${x} 
      V${y + radius} 
      Q${x},${y} ${x + radius},${y}
  `;
}
