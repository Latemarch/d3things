import * as d3 from "d3";
import { FeatureCollection } from "geojson";
/**
 * u may need div tag with id='map'
 */
type Props = {
  location?: Array<number>;
  otherOptions?: { [key: string]: any };
  setMap: (a: any) => any;
};
export function KakaoMapLoader({
  location = [33.450701, 126.570667],
  otherOptions = {},
  setMap,
}: Props) {
  const script = document.createElement("script");
  const container = document.getElementById("map");
  // script.type = "text/javascript";
  // script.async = true;
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
  document.head.appendChild(script);

  if (!container) return;

  const onLoadKakaoMap = () => {
    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(location[0], location[1]), // 지도의 중심좌표
        level: 9,
        ...otherOptions,
      };
      const map = new window.kakao.maps.Map(container, options);
      setMap(map);
    });
  };

  script.addEventListener("load", onLoadKakaoMap);
  script.addEventListener("reload", onLoadKakaoMap);
}

/**
 * Adjusts the zoom level of SVG elements based on Kakao Map's zoom level.
 *
 * @param {Object} options
 * @param {map} options.map - The Kakao Map instance on which zoom actions are performed.
 * @param {React.RefObject} options.ref - The React reference to the SVG element that needs to be zoomed.
 * @param {Array<number>} [options.location=[33.450701, 126.570667]] - The geographical coordinates [latitude, longitude] where the SVG is located on the map. Default is [33.450701, 126.570667].
 * @param {number} options.initialZoomLevel - The initial zoom level of the SVG element relative to the Kakao Map.
 *
 * @example
 * zoomSVGOnKakaoMap({ map: myMap, ref: mySvgRef, initialZoomLevel: 5 });
 */
export function zoomSVGOnKakaoMap({
  map,
  allSVG,
  initialZoomLevel,
}: {
  map: any;
  allSVG?: any;
  initialZoomLevel: number;
}) {
  allSVG.attr(
    "transform",
    `scale(${zoomLevel[initialZoomLevel] / zoomLevel[map.getLevel()]})`
  );
}

export const zoomLevel = [
  1, 15.6, 31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000,
  64000, 128000,
];

type AddFlowLine = {
  startPointId: number;
  endPointId: number;
  projection: d3.GeoProjection;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  mapData: FeatureCollection;
};
export function addFlow({
  startPointId,
  endPointId,
  projection,
  svg,
  mapData,
}: AddFlowLine) {
  const target = mapData.features.find(
    (f) => f.properties?.id === startPointId
  )!!;
  const source = mapData.features.find(
    (f) => f.properties?.id === endPointId
  )!!;
  const startPoint = d3.geoCentroid(target);
  const endPoint = d3.geoCentroid(source);
  const pointA = projection(startPoint);
  const pointB = projection(endPoint);
  if (!pointA || !pointB) return;

  const color = d3.interpolateHslLong("red", "yellow")(endPointId / 30);
  const gradientId = `gradient-${endPointId}`;

  const isALeft = pointA[0] < pointB[0];
  const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", isALeft ? "0%" : "100%") // 왼쪽에서 시작
    .attr("y1", "0%")
    .attr("x2", isALeft ? "100%" : "0%") // 오른쪽에서 끝
    .attr("y2", "0%");

  gradient
    .selectAll("stop")
    .data([
      { offset: "0%", color: "white" },
      {
        offset: "100%",
        color: color.replace(")", `, 0.1)`).replace("rgb", "rgba"),
      },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  d3.select(`path[data-id='${endPointId}']`).attr("fill", color);
  d3.select(`path[data-id='${startPointId}']`).attr("fill", "white");
  // .attr("opacity", "0.7");

  for (let i = 0; i < 20; i++) {
    const adjustedPointB = getRandomPoint(pointB, source, projection);
    const adjustedPointA = getRandomPoint(pointA, target, projection);

    const cosTheta = Math.sqrt(3) / 2; // 30도의 코사인 값
    const sinTheta = 0.5; // 30도의 사인 값

    const deltaX = adjustedPointB[0] - adjustedPointA[0];
    const deltaY = adjustedPointB[1] - adjustedPointA[1];

    const xPrime = deltaX * cosTheta - deltaY * sinTheta;
    const yPrime = deltaX * sinTheta + deltaY * cosTheta;

    const xFinal = adjustedPointA[0] + xPrime;
    const yFinal = adjustedPointA[1] + yPrime;

    const controlPoints = [
      adjustedPointA,
      [xFinal, yFinal],
      adjustedPointB,
    ] as [number, number][];

    // Adjust the beta value for the curve
    const betaValue = 0.2 + Math.random() * 0.5;

    const lineGenerator = d3.line().curve(d3.curveBundle.beta(betaValue));

    const pathData = lineGenerator(controlPoints);

    svg
      .append("g")
      .append("path")
      .attr("d", pathData)
      .attr("class", `flowLine ${startPointId}to${endPointId}`)
      .attr("fill", "none")
      .attr("stroke", `url(#${gradientId})`)
      .attr("opacity", "0.5")
      .attr("stroke-width", 0.4);
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
  numPoints = 10
): d3.GeoGeometryObjects {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const x = center[0] + radius * Math.cos(angle);
    const y = center[1] + radius * Math.sin(angle);
    points.push([x, y]);
  }
  points.push(points[0]); // 원을 닫기 위해 첫 번째 점을 다시 추가

  return {
    type: "Polygon",
    coordinates: [points],
  };
}
