import * as d3 from "d3";
import { JSDOM } from "jsdom";
import D3BarSSRHydration from "./D3BarSSRHydration";

interface Props {
  data: number[];
  width?: number;
  height?: number;
}

const eventData = [
  {
    name: "3천만명 ",
    year: 2000,
  },
  { name: "5천만명 진입!!!", year: 2010 },
  { name: "4천만명 진입!!", year: 2015 },
  { name: "3천만명 진입!", year: 2020 },
];
export default function D3BarSSR({ data, height = 90, width = 1400 }: Props) {
  const { document } = new JSDOM().window;
  const svg = d3
    .select(document.body)
    .append("svg")
    .attr("class", "d3BarSSR")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "2px solid steelblue")
    .append("g");
  const xScale = d3.scaleLinear([1970, 2050], [0, width]);

  // x-axis
  // const x = d3
  //   .axisBottom(xScale)
  //   .tickValues(Array.from({ length: 7 }, (_, i) => 1980 + i * 10));
  // const xAxis = svg
  //   .append("g")
  //   .attr("transform", `translate(0,${50})`)
  //   .attr("class", "x-axis")
  //   .call(x);
  // xAxis.selectAll("line").style("stroke", "none");
  // xAxis.select("path").style("stroke", "none");

  const bars = svg
    .selectAll("bar")
    .attr("class", "bars")
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
    .attr("class", "borders")
    .data(Array.from({ length: 7 }, (_, i) => 1980 + i * 10))
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d))
    .attr("y", 30)
    .attr("width", 1)
    .attr("height", 20)
    .attr("transform", "translate(-0.5,0)")
    .attr("fill", "white");
  const symbolGenerator = d3.symbol().type(d3.symbolDiamond).size(100);
  const marks = svg //
    .selectAll("mark")
    .data(eventData)
    .enter()
    .append("g")
    .attr("class", "mark")
    .attr("transform", (d) => `translate(${xScale(d.year)}, 40)`);

  const icons = marks
    .append("path")
    .attr("d", symbolGenerator)
    .attr("fill", "white");

  const handle = svg
    .selectAll(".handle")
    .data([2023])
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${xScale(d) - 5},10 )`)
    .attr("class", "ssrHandle");

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

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: document.body.innerHTML }}></div>
      <D3BarSSRHydration width={width} data={eventData} />
    </>
  );
}
