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
    addMap1({ mapData: data, width, height, map });
    // const mapPolygon = svg
    //   .selectAll("path")
    //   .append("g")
    //   .attr("class", "map1")
    //   .data(data.features)
    //   .enter()
    //   .append("path")
    //   .attr("d", (d: any) => geoGenerator(d))
    //   .attr("fill", "#69b3a2")
    //   .attr("stroke", "white")
    //   .attr("transform", `translate(${width / 2 - x},${height / 2 - y - 6})`)
    //   .on("mouseover", function (e, d) {
    //     d3.select(this).attr("fill", "#e8e8e8");
    //   })
    //   .on("mouseleave", function () {
    //     d3.select(this).attr("fill", "#69b3a2");
    //   })
    //   .on("click", function (e, d) {
    //     // console.log(projection.invert([e.x, e.y]));
    //   });

    const position = new window.kakao.maps.LatLng(center[1], center[0]);
    const content = document.getElementsByClassName("svg")[0] as HTMLElement;
    const custumOverlay = new window.kakao.maps.CustomOverlay({
      position,
      content,
    });
    custumOverlay.setMap(map);

    // addMap({ width, height, data: data.features[0], map });
    kakao.maps.event.addListener(map, "click", (e: any) => {
      const point = [e.latLng.La, e.latLng.Ma] as [number, number];
      console.log(point);
      const Dcenter = projection(point);
      console.log(Dcenter);
      const Kcenter = mapProjection.pointFromCoords(
        new kakao.maps.LatLng(point[1], point[0])
      );
      console.log(e);
    });

    kakao.maps.event.addListener(map, "zoom_changed", () =>
      zoomSVGOnKakaoMap({
        map,
        allSVG: d3.select(".mapBody").selectAll("svg"),
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
    <div className="mapBody">
      <div ref={ref} className="svg" />
      <div
        id="map"
        style={{ position: "fixed", width: "100vw", height: "100vh" }}
      />
    </div>
  );
}

function addPolygon({
  e,
  map,
  initialZoomLevel,
  data,
  geoGenerator,
  projection,
}: {
  e: any;
  map: any;
  initialZoomLevel: number;
  data?: any;
  geoGenerator: any;
  projection: any;
}) {
  const position = new window.kakao.maps.LatLng(e.latLng.Ma, e.latLng.La);
  const newDiv = document.createElement("div");
  const scale = zoomLevel[initialZoomLevel] / zoomLevel[map.getLevel()];
  const width = 1000;
  const height = 1000;
  document.body.appendChild(newDiv);

  const center = d3.geoCentroid(data);
  const [x, y] = projection(center) as Array<number>;
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
    .attr("fill", "red")
    .attr("transform", `translate(${width / 2 - x},${height / 2 - y - 6})`)
    .attr("stroke", "white");
  // .attr("transform", `translate(${width / 2 - x},${height / 2 - y})`);
  const custumOverlay = new window.kakao.maps.CustomOverlay({
    position,
    content: newDiv,
  });
  custumOverlay.setMap(map);
}

type Addmap = {
  map: any;
  data: any;
  width: number;
  height: number;
  projection: any;
  geoGenerator: any;
};
function addMap({
  map,
  data,
  width,
  height,
  projection,
  geoGenerator,
}: Addmap) {
  const center = d3.geoCentroid(data);
  const position = new window.kakao.maps.LatLng(center[1], center[0]);
  const [x, y] = projection(center) as Array<number>;
  const newDiv = document.createElement("div");
  // const scale = zoomLevel[initialZoomLevel] / zoomLevel[map.getLevel()];
  document.body.appendChild(newDiv);

  d3.select(newDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .append("path")
    .attr("d", geoGenerator(data))
    .attr("fill", "#69b3a2")
    .attr("opacity", 0.5)
    .attr("stroke", "white")
    .attr("transform", `translate(${width / 2 - x},${height / 2 - y - 5})`);
  // .attr("stroke", "white");
  const custumOverlay = new window.kakao.maps.CustomOverlay({
    position,
    content: newDiv,
  });
  custumOverlay.setMap(map);
}

type AddMap1 = {
  mapData: any;
  map: any;
  width: number;
  height: number;
};
function addMap1({ mapData, map, width, height }: AddMap1) {
  const projection = d3.geoMercator().fitWidth(578, mapData);
  const geoGenerator = d3.geoPath().projection(projection);
  for (let feature of mapData.features)
    addMap({ map, width, height, data: feature, projection, geoGenerator });
}
