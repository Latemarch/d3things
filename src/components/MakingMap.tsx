// import D3SSRMapGenerator from "@/components/Map/D3SSRMapGenerator";
// import D3TopoMap from "@/components/Simulator/Living/D3TopoMap";
// import {
//   getFile,
//   getLocalFile,
//   getTopojsonKorea,
//   saveJson,
// } from "@/service/server";
// import { FeatureCollection } from "geojson";

// import * as topojson from "topojson-client";
// import * as topojsonServer from "topojson-server";

// export default async function page() {
//   function extractUniquesidoValues(topoKorea: any): string[] {
//     const geometries = topoKorea.objects.jjh.geometries;
//     const sidoValues: string[] = geometries.map(
//       (geometry: any) => geometry.properties.sido
//     );

//     // Remove duplicates
//     //@ts-expect-error
//     return [...new Set(sidoValues)];
//   }

//   // 사용 예시
//   const topoKorea = await getTopojsonKorea();
//   const uniquesidoValues = extractUniquesidoValues(topoKorea);
//   const featureCollection = createFeatureCollectionForsido(
//     topoKorea,
//     uniquesidoValues
//   );
//   console.log(featureCollection.features[0]);
//   saveJson(featureCollection, "sidoKorea.json");

//   return (
//     <div className="flex bg-gray-300 w-full h-full justify-center items-center">
//       {/* <D3TopoMap /> */}
//       <D3SSRMapGenerator mapData={topoKorea} geoMapData={featureCollection} />
//     </div>
//   );
// }
// function createFeatureCollectionForsido(
//   topoKorea: any,
//   uniquesidoValues: string[]
// ) {
//   // 각각의 sido에 대한 geojson feature를 추출하는 함수
//   function createsidoFeature(sido: string) {
//     // 같은 sido 값을 갖는 폴리곤들을 모음
//     const filteredGeometries = topoKorea.objects.jjh.geometries.filter(
//       (geometry: any) => geometry.properties.sido === sido
//     );

//     // 해당 폴리곤들을 새로운 topojson object로 만듬
//     const filteredTopoObject = {
//       type: "GeometryCollection",
//       geometries: filteredGeometries,
//     };

//     const meshed = topojson.mesh(
//       topoKorea,
//       //@ts-expect-error
//       filteredTopoObject,
//       (a, b) => a === b
//     );
//     const propertiesWithoutAdm = Object.keys(
//       filteredGeometries[0].properties
//     ).reduce((result, key) => {
//       if (!key.startsWith("sgg") && !key.startsWith("adm") && key !== "temp") {
//         result[key] = filteredGeometries[0].properties[key];
//       }
//       return result;
//     }, {} as any);

//     // geojson의 feature로 변환 후 properties를 빈 객체로 할당
//     const feature = {
//       type: "Feature",
//       geometry: meshed,
//       properties: propertiesWithoutAdm, // adm 데이터 버림
//     };

//     return feature;
//   }

//   // 모든 sido 값에 대한 feature들을 추출
//   const features = uniquesidoValues.map((sido) => createsidoFeature(sido));

//   // FeatureCollection으로 반환
//   return {
//     type: "FeatureCollection",
//     features: features,
//   };
// }
