"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { KakaoMapLoader, zoomLevel, zoomSVGOnKakaoMap } from "@/service/client";

interface Props {
  data?: any;
  height?: number;
  width?: number;
}

export default function D3KakaoMap({ data, width = 800, height = 500 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>();
  const initialZoomLevel = 9;

  useEffect(() => {
    KakaoMapLoader({
      setMap: setMap,
      location: [37.5642, 127.00169],
      otherOptions: { level: initialZoomLevel },
    });
    if (!ref.current) return;
    console.log("what");
    console.log(ref.current);

    //Remove any existing SVG
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("position", "fixed")
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid steelblue")
      .append("g");

    const line = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1]);

    svg
      .append("rect")
      .attr("id", "rect1")
      .attr("width", 100)
      .attr("height", 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!map || !window.kakao) return;

    const position = new window.kakao.maps.LatLng(37.5642, 127.00169);
    const content = document.getElementsByClassName("svg")[0];
    const custumOverlay = new window.kakao.maps.CustomOverlay({
      position,
      content,
    });
    custumOverlay.setMap(map);

    kakao.maps.event.addListener(map, "click", (e: any) => {
      addSqure({ e, map, initialZoomLevel });
    });

    kakao.maps.event.addListener(map, "zoom_changed", () =>
      zoomSVGOnKakaoMap({
        map,
        allSVG: d3.select(".body").selectAll("svg"),
        initialZoomLevel,
      })
    );
    return () => {
      kakao.maps.event.removeListener(map, "zoom_changed", () =>
        zoomSVGOnKakaoMap({
          map,
          allSVG: d3.selectAll("svg"),
          initialZoomLevel,
        })
      );
    };
  }, [map]);

  return (
    <div>
      <div ref={ref} className="svg" />
      <div
        id="map"
        style={{ position: "fixed", width: "100vw", height: "100vh" }}
      />
    </div>
  );
}

function addSqure({
  e,
  map,
  initialZoomLevel,
}: {
  e: any;
  map: any;
  initialZoomLevel: number;
}) {
  const position = new window.kakao.maps.LatLng(e.latLng.Ma, e.latLng.La);
  const newDiv = document.createElement("div");
  const scale = zoomLevel[initialZoomLevel] / zoomLevel[map.getLevel()];
  document.body.appendChild(newDiv);
  d3.select(newDiv)
    .append("svg")
    .attr("width", 100)
    .attr("height", 100)
    .attr("transform", `scale(${scale})`)
    .style("border", "1px solid steelblue");
  const custumOverlay = new window.kakao.maps.CustomOverlay({
    position,
    content: newDiv,
  });
  custumOverlay.setMap(map);
}
