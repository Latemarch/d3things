/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { KakaoMapLoader, zoomLevel, zoomSVGOnKakaoMap } from "@/service/client";
import { Feature } from "geojson";

interface Props {
  data?: any;
  height?: number;
  width?: number;
}

export default function D3KakaoMap({ data }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(undefined);
  const initialZoomLevel = 9;

  const center = d3.geoCentroid(data);
  const projection = d3.geoMercator().fitWidth(578, data);
  const geoGenerator = d3.geoPath().projection(projection);

  //kakao Map load
  useEffect(() => {
    console.log(center);
    KakaoMapLoader({
      setMap: setMap,
      location: [center[1], center[0]],
      otherOptions: { level: initialZoomLevel },
    });
  }, []);

  useEffect(() => {
    if (!map || !window.kakao) return;

    const mapProjection = map.getProjection();
    const mapBounds = map.getBounds();
    const mapSW = mapBounds.getSouthWest();
    const mapNE = mapBounds.getNorthEast();
    const SWCoords = mapProjection.pointFromCoords(mapSW);
    const NECoords = mapProjection.pointFromCoords(mapNE);
    const width = NECoords.x;
    const height = SWCoords.y;

    if (!ref.current) return;
    d3.select(ref.current).selectAll("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("position", "fixed")
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid steelblue")
      .style("opacity", "0.5")
      .append("g");

    const [x, y] = projection(center) as Array<number>;
    const mapPolygon = svg
      .selectAll("path")
      .append("g")
      .attr("class", "map1")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", (d: any) => geoGenerator(d))
      .attr("fill", "#69b3a2")
      .attr("stroke", "white")
      .attr("transform", `translate(${width / 2 - x},${height / 2 - y - 6})`)
      .on("mouseover", function (e, d) {
        d3.select(this).attr("fill", "#e8e8e8");
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#69b3a2");
      })
      .on("click", function (e, d) {
        // console.log(projection.invert([e.x, e.y]));
      });

    const position = new window.kakao.maps.LatLng(center[1], center[0]);
    const content = document.getElementsByClassName("svg")[0] as HTMLElement;
    const custumOverlay = new window.kakao.maps.CustomOverlay({
      position,
      content,
    });
    custumOverlay.setMap(map);
    const projectionObj = map.getProjection();
    console.log(projectionObj);

    // kakao.maps.event.addListener(map, "click", (e: any) => {
    //   console.log(e.latLng);
    // });

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
    <div className="body">
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
  data,
  geoGenerator,
}: {
  e: any;
  map: any;
  initialZoomLevel: number;
  data?: any;
  geoGenerator: any;
}) {
  const position = new window.kakao.maps.LatLng(e.latLng.Ma, e.latLng.La);
  const newDiv = document.createElement("div");
  const scale = zoomLevel[initialZoomLevel] / zoomLevel[map.getLevel()];
  const width = 1000;
  const height = 1000;
  document.body.appendChild(newDiv);
  d3.select(newDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    // .attr("transform", `scale(${scale})`)
    // .style("border", "1px solid steelblue");
    .append("g")
    .attr("class", "map1")
    .append("path")
    .attr("d", geoGenerator(data))
    .attr("fill", "#69b3a2")
    .attr("stroke", "white");
  // .attr("transform", `translate(${width / 2 - x},${height / 2 - y})`);
  const custumOverlay = new window.kakao.maps.CustomOverlay({
    position,
    content: newDiv,
  });
  custumOverlay.setMap(map);
}
