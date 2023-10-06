import D3Map from "@/components/D3Map";
import D3KakaoMap from "@/components/D3kakaomap";
import { getLocalMap, getMap } from "@/service/server";

const baseUrl = process.env.SERVER_BASEURL!!;
const appKey = process.env.KAKAO_MAP_API!!;
export default async function page() {
  // const mapData = await getMap("korea.geojson");
  const mapData = await getLocalMap();
  // const mapData: FeatureCollection = await fetch(
  //   baseUrl + `future-population/polygon/sido/d`
  // )
  //   .then((res) => res.json())
  //   .then((result) => convertToGeoJSON(result) as FeatureCollection);
  // console.log(mapData.features[0]);

  return (
    <div className="p-4">
      <D3KakaoMap data={mapData} />
      {/* <D3Map mapData={mapData} /> */}
    </div>
  );
}

function convertToGeoJSON(data: any) {
  return {
    type: "FeatureCollection",
    features: data.map((item: any) => item.alias1.feature),
  };
}
