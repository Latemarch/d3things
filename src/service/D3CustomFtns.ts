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
        level: 5,
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
  sourcePointId: number;
  targetPointId: number;
  scaleRef: any;
  projection: d3.GeoProjection;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  mapData: FeatureCollection;
};
export function addFlow({
  sourcePointId,
  targetPointId,
  projection,
  svg,
  mapData,
  scaleRef,
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

  d3.select(`path[data-id='${sourcePointId}']`).attr("fill", color);
  d3.select(`path[data-id='${targetPointId}']`).attr("fill", "white");
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
      .duration(0);

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
