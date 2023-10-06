import D3Map from "@/components/D3Map";
import D3PopulationPyramid from "@/components/D3PopulationPyramid";
import D3Slider from "@/components/D3Slider";
import D3KakaoMap from "@/components/D3kakaomap";
import KakaoMap from "@/components/KakaoMap";
import { getMap } from "@/service/server";
import { FeatureCollection } from "geojson";

const baseUrl = process.env.SERVER_BASEURL!!;
const appKey = process.env.KAKAO_MAP_API!!;
export default async function page() {
  const mapData = await getMap("korea.geojson");
  // const mapData: FeatureCollection = await fetch(
  //   baseUrl + `future-population/polygon/sido/d`
  // )
  //   .then((res) => res.json())
  //   .then((result) => convertToGeoJSON(result) as FeatureCollection);
  // console.log(mapData.features[0]);

  return (
    <div className="p-4">
      <D3KakaoMap />
    </div>
  );
}

function convertToGeoJSON(data: any) {
  return {
    type: "FeatureCollection",
    features: data.map((item: any) => item.alias1.feature),
  };
}
