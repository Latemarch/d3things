import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Feature, FeatureCollection, MultiLineString } from "geojson";
import { Topology, GeometryObject } from "topojson-specification";
type AddFlowLine = {
  sourcePointId: number;
  targetPointId: number;
  projection: d3.GeoProjection;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  mapData: FeatureCollection;
  idx: number;
};
export function addFlow({
  sourcePointId,
  targetPointId,
  projection,
  svg,
  mapData,
  idx,
}: AddFlowLine) {
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

  d3.select(`path[data-id='${sourcePointId}']`)
    .transition()
    .delay(idx * 200)
    .duration(3000)
    .attr("fill", color);
  d3.select(`path[data-id='${targetPointId}']`)
    .transition()
    .duration(5000)
    .attr("fill", "white");
  // .attr("opacity", "0.7");

  for (let i = 0; i < 20; i++) {
    const adjustedTargetPoint = getRandomPoint(targetPoint, target, projection);
    const adjustedSourcePoint = getRandomPoint(sourcePoint, source, projection);

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
      .attr("d", pathData)
      .attr("opacity", 0.5)
      .transition()
      .delay(i * 500)
      .duration(idx * 200 + 5000);

    const totalLength = path.node()?.getTotalLength() as number;
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
}

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

// 10/18
export function getGeoMapFromTopo(
  topoMap: Topology,
  localCode?: string,
  objName: string = "jjh",
  width: number = 2000,
  height: number = 600
): {
  geoMap: FeatureCollection;
  boundaries: MultiLineString;
  projection: d3.GeoProjection;
  geoGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>;
} {
  const objectName = objName;
  const geometries = (topoMap.objects[objectName] as any).geometries;

  let selectedGeometries = geometries;
  if (localCode) {
    selectedGeometries = geometries.filter(
      (geometry: any) =>
        geometry.properties[localCode.length > 2 ? "sgg" : "sido"] === localCode
    );
  }

  const selectedTopoObject = {
    type: "GeometryCollection",
    geometries: selectedGeometries,
  };

  //@ts-expect-error
  const geoMap: FeatureCollection = topojson.feature(
    topoMap,
    selectedTopoObject as GeometryObject
  );

  const boundaries = topojson.mesh(
    topoMap,
    selectedTopoObject as GeometryObject,
    (a, b) => a === b
  );

  const projection = d3.geoMercator().fitExtent(
    [
      [0, 0],
      [width, height * 1.4],
    ],
    geoMap
  );

  const geoGenerator = d3.geoPath().projection(projection);

  return { geoMap, boundaries, projection, geoGenerator };
}

export async function getInnerBoundry(scale: string, localCode?: string) {
  const geoKorea = await getFile(`${scale}Korea.json`);
  if (!localCode) return geoKorea;
  const boundryScale =
    localCode.length === 2 ? "sido" : localCode.length === 5 ? "sgg" : "adm";
  const filteredMap = geoKorea.features.filter(
    (feature: Feature) =>
      feature.properties && feature.properties[boundryScale] === localCode
  );
  const geoMap: FeatureCollection = {
    type: "FeatureCollection",
    features: filteredMap,
  };
  return geoMap;
}
