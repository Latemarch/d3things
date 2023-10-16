import { getTopojsonKorea } from "@/service/server";
import * as d3 from "d3";
import { FeatureCollection, GeoJsonObject } from "geojson";
import { JSDOM } from "jsdom";
import * as topojson from "topojson-client";
import HydratingMap from "./D3HydrationComponents/HydratingMap";

export default async function D3TopoMap() {
  const { document } = new JSDOM().window;
  // const mapData: FeatureCollection = await getSidoScaleMap();
  const topoData = await getTopojsonKorea();
  const width = 2000;
  const height = 600;

  const container = d3.select(document.body).append("svg");

  container
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "topoMap")
    .style("background-color", "#2b2b2b");

  //@ts-ignore
  const mapData: FeatureCollection = topojson.feature(
    topoData,
    topoData.objects.hjd230701
  );
  const boundaries = topojson.mesh(
    topoData,
    topoData.objects.hjd230701,
    (a, b) => a === b
  );

  const projection = d3.geoMercator().fitExtent(
    [
      [0, 0],
      [width, height * 1.4],
    ],
    mapData
  );

  const geoGenerator = d3.geoPath().projection(projection);

  const svg = container.append("g").attr("transform", "translate(0,-150)");
  svg
    .append("path")
    .datum(boundaries)
    .attr("d", geoGenerator)
    .attr("fill", "none")
    .attr("stroke", "#c4c4c4")
    .attr("stroke-width", 0.4);
  // const map = svg
  //   .selectAll("path")
  //   .append("g")
  //   .attr("class", "map1")
  //   .data(mapData.features)
  //   .enter()
  //   .append("path")
  //   .attr("d", geoGenerator)
  //   .attr("fill", "#0e0e0e")
  //   .attr("stroke", "#545454")
  //   .attr("stroke-width", 0.2)
  //   .attr("data-id", (d) => d.properties?.id);

  dummyFlow.forEach((el, i) => {
    const sourcePointId = el.id;
    const targetPointId = 11;
    const source = mapData.features.find(
      (f) => +f.properties?.sido === sourcePointId
    )!!;
    const target = mapData.features.find(
      (f) => +f.properties?.sido === targetPointId
    )!!;
    const targetCenter = d3.geoCentroid(target);
    const sourceCenter = d3.geoCentroid(source);
    const sourcePoint = projection(sourceCenter);
    const targetPoint = projection(targetCenter);
    if (!sourcePoint || !targetPoint) return;
    const color = d3.interpolateHslLong("red", "yellow")(sourcePointId / 50);
    const gradientId = `gradient-${sourcePointId}`;

    const isALeft = sourcePoint[0] < targetPoint[0];
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", isALeft ? "0%" : "100%")
      .attr("x2", isALeft ? "100%" : "0%")
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
      const betaValue = 0.3 + Math.random() * 0.3;
      const lineGenerator = d3.line().curve(d3.curveBundle.beta(betaValue));
      const pathData = lineGenerator(controlPoints);

      const path = svg
        .append("path")
        .attr("class", `flowLine ${sourcePointId}to${targetPointId}`)
        .attr("fill", "none")
        .attr("stroke-width", 0.5)
        .attr("stroke", `url(#${gradientId})`)
        .attr("d", pathData)
        .attr("opacity", 0.5);

      path
        .attr("stroke-dasharray", 10000 + " " + 10000)
        .attr("stroke-dashoffset", 10000);
    }
  });
  return (
    <div className="relative flex w-full h-full">
      <div
        className="fixed flex w-full h-full "
        dangerouslySetInnerHTML={{ __html: document.body.innerHTML }}
      ></div>
      <HydratingMap />
    </div>
  );
}

const dummyFlow = [
  { id: 26, flow: 10000 },
  { id: 27, flow: 20000 },
  { id: 28, flow: 30000 },
  { id: 29, flow: 40000 },
  { id: 30, flow: 50000 },
  { id: 31, flow: 60000 },
  { id: 41, flow: 70000 },
  { id: 42, flow: 90000 },
  { id: 43, flow: 100000 },
  { id: 44, flow: 110000 },
  { id: 45, flow: 120000 },
  { id: 46, flow: 130000 },
  { id: 47, flow: 140000 },
  { id: 48, flow: 150000 },
  { id: 50, flow: 160000 },
  // { id: 16, flow: 160000 },
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
