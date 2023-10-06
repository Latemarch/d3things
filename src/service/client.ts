import * as d3 from "d3";
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
