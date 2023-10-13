// import { getSidoScaleMap } from "@/service/server";
import { getLocalMap, getMap } from "@/service/server";
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";
import { JSDOM } from "jsdom";

export default async function D3ssr() {
  const { document } = new JSDOM().window;
  const mapData: FeatureCollection = await getMap("seoul.json");
  const width = 600;
  const height = 600;

  const svg = d3.select(document.body).append("svg");

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "d3Map")
    // .attr("width", 1000)
    // .attr("height", 1000)
    .style("border", "2px solid steelblue");
  // .append("g");

  const projection = d3.geoMercator().fitExtent(
    [
      [0, 30],
      [width, height],
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
    .attr("data-id", (d: Feature) => d.properties?.id);

  dummyFlow.forEach((el) => {
    const sourcePointId = el.id;
    const targetPointId = 21;
    const source = mapData.features.find(
      (f) => f.properties?.id === sourcePointId
    )!!;
    const target = mapData.features.find(
      (f) => f.properties?.id === targetPointId
    )!!;
    const targetCenter = d3.geoCentroid(target);
    const sourceCenter = d3.geoCentroid(source);
    const sourcePoint = projection(sourceCenter);
    const targetPoint = projection(targetCenter);
    if (!sourcePoint || !targetPoint) return;
    const color = d3.interpolateHslLong("red", "yellow")(sourcePointId / 30);
    const gradientId = `gradient-${sourcePointId}`;

    const isALeft = sourcePoint[0] < targetPoint[0];
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", isALeft ? "0%" : "100%") // 왼쪽에서 시작
      .attr("x2", isALeft ? "100%" : "0%") // 오른쪽에서 끝
      // .attr("x1", "100%")
      // .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "0%");
    gradient
      .selectAll("stop")
      .data([
        {
          offset: "0%",
          color: color.replace(")", `, 0.1)`).replace("rgb", "rgba"),
        },
        {
          offset: "80%",
          color: "white",
        },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    svg.select(`path[data-id='${sourcePointId}']`).attr("fill", color);
    svg.select(`path[data-id='${targetPointId}']`).attr("fill", "white");
    for (let i = 0; i < 20; i++) {
      const adjustedTargetPoint = getRandomPoint(
        targetPoint,
        target,
        projection
      );
      const adjustedSourcePoint = getRandomPoint(
        sourcePoint,
        source,
        projection
      );

      const cosTheta = Math.sqrt(3) / 2; // 30도의 코사인 값
      const sinTheta = 0.5; // 30도의 사인 값

      const deltaX = adjustedTargetPoint[0] - adjustedSourcePoint[0];
      const deltaY = adjustedTargetPoint[1] - adjustedSourcePoint[1];

      const xPrime = deltaX * cosTheta - deltaY * sinTheta;
      const yPrime = deltaX * sinTheta + deltaY * cosTheta;

      const xFinal = adjustedSourcePoint[0] + xPrime;
      const yFinal = adjustedSourcePoint[1] + yPrime;

      const controlPoints = [
        adjustedSourcePoint,
        [xFinal, yFinal],
        adjustedTargetPoint,
      ] as [number, number][];

      // Adjust the beta value for the curve
      const betaValue = 0.2 + Math.random() * 0.5;
      const lineGenerator = d3.line().curve(d3.curveBundle.beta(betaValue));
      const pathData = lineGenerator(controlPoints);

      const path = svg
        .append("path")
        .attr("class", `flowLine ${sourcePointId}to${targetPointId}`)
        .attr("fill", "none")
        .attr("stroke-width", 0.5)
        .attr("stroke", `url(#${gradientId})`)
        .attr("d", pathData)
        .attr("opacity", 0.5)
        .transition()
        .delay(i * 500)
        .duration(0);

      const totalLength = 300;
      path.on("start", function repeat() {
        //@ts-ignore
        d3.active(this)
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(10000)
          .ease(d3.easeLinear)
          .attr("stroke", `url(#${gradientId})`)
          .attr("stroke-dashoffset", -totalLength)
          .transition()
          .duration(0)
          .on("start", repeat);
      });
    }
  });
  return (
    <div
      className="flex w-full h-full"
      dangerouslySetInnerHTML={{ __html: document.body.innerHTML }}
    ></div>
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
