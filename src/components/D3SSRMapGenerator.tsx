import { JSDOM } from "jsdom";
import * as d3 from "d3";
import { getGeoMapFromTopo, getInnerBoundry } from "@/service/D3CostumFtns";
import { getTopojsonKorea } from "@/service/server";

type Props = {
  innderBoundryScale?: string;
  objName?: string;
  width?: number;
  height?: number;
  localCode?: string;
  style?: Record<string, string>;
};
/**
 * D3SSRMapGenerator는  주어진 params와 함께 svg에 map을 그리는 async function 입니다.
 * param으로 아무것도 주어지지 않으면 전국 경계만 그려집니다.
 * localCode를 입력하면 해당 localCode에 맞는 지역의 경계가 나타납니다.
 * innerBoundryScale에 경계 안쪽에 그리고자 할 지역의 규모를 정할 수 있습니다.
 * width, height는 사용 환경에 따라 전체화면에 문제가 생길시 설정.
 * style은 bgColor, fill, stroke, stroke-width에만 적용되며 자세한 설명은 hydration으로 설정하세요.
 *
 *
 * @param innderBoundryScale - Scale for inner boundaries. Determines which boundary to draw.
 * @param width - Width of the map. Default is 2000.
 * @param height - Height of the map. Default is 600.
 * @param localCode - Local code to filter and display specific regions.
 * @param style
 *                {
 *                  fill: string,       // Fill color for the map paths.
 *                  stroke: string,     // Stroke color for the map paths.
 *                  strokeWidth: string | number,  // Stroke width for the map paths.
 *                  bgColor: string
 *                  x: number //translate value
 *                  y: number //translate value
 *                }
 *
 * @returns A JSX element representing the generated map.
 */
export default async function D3SSRMapGenerator({
  innderBoundryScale,
  width = 2000,
  height = 600,
  localCode,
  style,
}: Props) {
  const { document } = new JSDOM().window;
  const mapData = await getTopojsonKorea();

  // svg 정의부분
  const container = d3.select(document.body).append("svg");
  container
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "mapContainer")
    .style("background-color", style?.bgColor ?? "#2b2b2b");
  const svg = container
    .append("g")
    .attr("transform", `translate(${style?.x ?? 100},${style?.y ?? -150})`);

  // 따로 전달받은 topoJson이 없으면 전국 외곽선을 그림
  const { geoMap, boundaries, projection, geoGenerator } = getGeoMapFromTopo(
    mapData,
    localCode
  );

  // 맵 경계를 그리는 부분
  svg
    .append("g")
    .attr("class", "mapBoundary")
    .append("path")
    .datum(boundaries)
    .attr("d", geoGenerator)
    .attr("fill", style?.fill ?? "none")
    .attr("stroke", style?.stroke ?? "#c4c4c4")
    .attr("stroke-width", style?.strokeWidth ?? 0.3);

  // 안쪽 경계를 그릴지 판단하여 그림.
  if (innderBoundryScale) {
    const data = await getInnerBoundry(innderBoundryScale, localCode);
    svg
      .selectAll("local")
      .append("g")
      .attr("class", "map")
      .data(data.features as d3.GeoPermissibleObjects[])
      .enter()
      .append("path")
      .attr("d", geoGenerator)
      .attr("data-id", (d: any) => d.properties.sido ?? d.properties.sgg)
      .attr("fill", style?.fill ?? "none")
      .attr("stroke", style?.stroke ?? "#c4c4c4")
      .attr("stroke-width", style?.strokeWidth ?? 0.3);
  }

  return (
    <div className="relative flex w-full h-full justify-center">
      <div
        className="fixed flex"
        style={{ width: "100vw", height: "100vh" }}
        dangerouslySetInnerHTML={{ __html: document.body.innerHTML }}
      ></div>
    </div>
  );
}
