"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useRecoilState } from "recoil";
import { LivingPredictionSliderPoint } from "@/context/atom";

type TData = { time: number; population: number };
interface Props {
  data: Array<TData>;
  height?: number;
  width?: number;
}

export default function D3PredictionBar({
  data,
  height = 80,
  width = 300,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useRecoilState(LivingPredictionSliderPoint);
  const { maxTickValue, tickValues, getColor } = getTicksAndFnt(data);

  useEffect(() => {
    if (!ref.current) return;

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width + 60} ${height + 130}`)
      .append("g")
      .attr("transform", `translate(32,30)`);

    const x = d3.scaleLinear([0, 23], [0, width]);
    const y = d3.scaleLinear([0, maxTickValue], [height, 0]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues([0, 12, 23])
          .tickFormat((d) => d + "시")
      );
    xAxis.selectAll("line").attr("stroke", "none");
    xAxis.selectAll("path").attr("stroke", "none");
    xAxis
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "600");

    const line = d3
      .line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    const yAxis = svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .tickValues(tickValues)
          .tickFormat((d) => (Number(d) / 10000).toString())
      )
      .attr("transform", "translate(-5,0)")
      .style("text-anchor", "center");
    yAxis.selectAll("line").attr("stroke", "none");
    yAxis.selectAll("path").attr("stroke", "none");

    svg
      .append("text")
      .text("(만명)")
      .style("font-size", "10px")
      .attr("x", -32)
      .attr("y", -10);
    const barGroup = svg
      .selectAll("g.barGroup")
      .data(data)
      .join("g")
      .attr("transform", (d, i) => `translate(${x(i)}, 0)`);

    barGroup
      .append("rect")
      .attr("x", -5)
      .attr("y", (d) => y(d.population))
      .attr("fill", (d) => getColor(d.population))
      .attr("width", 10)
      .attr("height", (d) => height - y(d.population));

    const symbolGenerator = d3.symbol().type(d3.symbolTriangle).size(40);
    const indicator = barGroup
      .append("path")
      .attr("d", symbolGenerator)
      .attr("transform", "translate(0,-10) rotate(180)")
      .attr("fill", (d) =>
        pointer === d.time ? getColor(d.population) : "none"
      );
    const dashLine = barGroup
      .append("line")
      .attr("x1", 0)
      .attr("y1", -4)
      .attr("x2", 0)
      .attr("y2", (d) => y(d.population))
      .attr("stroke", (d) => (pointer === d.time ? "#909299" : "none"))
      .attr("stroke-dasharray", "2,3");

    svg
      .append("path")
      .attr(
        "d",
        line([
          [-0.5, height - 100],
          [23.5, height - 100],
        ])
      )
      .attr("stroke", "#909299");
    //Slider
    const slider = svg
      .append("g")
      .attr("transform", `translate(${0},${height + 30})`);
    slider
      .append("rect")
      .attr("fill", "#e8e8e8")
      .attr("width", width)
      .attr("height", 4);

    const display = slider
      .append("text")
      .attr("x", width / 2 + 6)
      .attr("text-anchor", "middle")
      .attr("y", 30)
      .style("font-size", "12px")
      .text(pointer + "시");

    slider
      .selectAll(".boundaryCircle")
      .data([0, 23])
      .enter()
      .append("circle")
      .attr("fill", "#e8e8e8")
      .attr("cx", (d) => x(d))
      .attr("cy", 2)
      .attr("r", 2);
    const handleGroup = slider
      .append("g")
      .attr("transform", `translate(${x(pointer) - 2.5},-5)`);
    handleGroup
      .append("rect")
      .attr("width", 5)
      .attr("height", 15)
      .attr("fill", "#989898");

    const drag = d3.drag<SVGGElement, unknown, number>().on("drag", dragging);

    handleGroup.call(drag);

    //Label
    const labelGroup = svg
      .append("g")
      .attr("transform", `translate(${width / 2 - 70},${height + 85})`);

    const labelTime = labelGroup.append("text").text(pointer + "시");
    const labelIndicator = labelGroup
      .append("circle")
      .attr("cx", 40)
      .attr("cy", -5)
      .attr("r", 5)
      .attr("fill", getColor(data[pointer].population));
    const labelStatus = labelGroup
      .append("text")
      .attr("x", 50)
      .text(getColor(data[pointer].population) === "#1fd369" ? "여유" : "혼잡");
    const labelFlow = labelGroup
      .append("text")
      .attr("x", 90)
      .text(formatNumber(data[pointer].population) + "명");

    function dragging(
      this: SVGElement,
      e: d3.D3DragEvent<SVGElement, number, number>
    ) {
      let newX = e.x;
      if (newX < 0) newX = 0;
      if (newX > width) newX = width;
      const quantizeScale = d3
        .scaleQuantize()
        .domain([0, width])
        .range(d3.range(0, 24, 1));
      const quantizedValue = quantizeScale(newX);
      d3.select(this).attr("transform", `translate(${newX - 2.5},-5)`);
      display.text(quantizedValue + "시");
      indicator.attr("fill", (d) =>
        quantizedValue === d.time ? getColor(d.population) : "none"
      );
      dashLine.attr("stroke", (d) =>
        quantizedValue === d.time ? "#909299" : "none"
      );
      labelTime.text(quantizedValue + "시");
      labelIndicator.attr("fill", getColor(data[quantizedValue].population));
      labelStatus.text(
        getColor(data[quantizedValue].population) === "#1fd369"
          ? "여유"
          : "혼잡"
      );
      labelFlow.text(formatNumber(data[quantizedValue].population) + "명");
      setPointer(quantizedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref}></div>;
}

function getTicksAndFnt(data: TData[]) {
  const maxPopulation = Math.max(...data.map((d) => d.population));
  const maxTickValue = Math.ceil(maxPopulation / 5000) * 5000;
  const tickValues = Array.from(
    { length: maxTickValue / 5000 + 1 },
    (_, i) => i * 5000
  );
  function getColor(value: number) {
    if (value >= maxPopulation) {
      return "#fd8040";
    } else if (value >= maxPopulation * 0.8) {
      return "#feb103";
    } else {
      return "#1fd369";
    }
  }
  return { tickValues, getColor, maxTickValue };
}

function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

// const data = [
//   { time: 0, population: 7000 },
//   { time: 1, population: 6500 },
//   { time: 2, population: 6000 },
//   { time: 3, population: 5500 },
//   { time: 4, population: 6000 },
//   { time: 5, population: 8000 },
//   { time: 6, population: 11000 },
//   { time: 7, population: 10000 },
//   { time: 8, population: 10000 },
//   { time: 9, population: 11000 },
//   { time: 10, population: 12000 },
//   { time: 11, population: 13000 },
//   { time: 12, population: 14000 },
//   { time: 13, population: 15000 },
//   { time: 14, population: 20000 },
//   { time: 15, population: 22000 }, // 피크
//   { time: 16, population: 20000 },
//   { time: 17, population: 18000 },
//   { time: 18, population: 17000 },
//   { time: 19, population: 15000 },
//   { time: 20, population: 13000 },
//   { time: 21, population: 14000 },
//   { time: 22, population: 13000 },
//   { time: 23, population: 10000 },
// ];
